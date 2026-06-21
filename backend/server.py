"""ghostel.app FastAPI backend - landing page + admin panel."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import io
import csv
import httpx
import hashlib
import re
import asyncio
import time
from urllib.parse import urlparse
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Literal

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, Query
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel, EmailStr, Field

from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    extract_token,
    get_current_user,
    require_admin,
)
from seed import seed_sample_data
from ghostel_client import ghostel_client

# ----- DB setup -----
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="ghostel.app API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ghostel")


# ----- Pydantic models -----
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    title: Optional[str] = ""
    username: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str
    totp_code: Optional[str] = Field(default=None, min_length=6, max_length=8)


class UpdateUserIn(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class GroupCreateIn(BaseModel):
    name: str
    description: Optional[str] = ""
    visibility: str = "public"


class GroupUpdateIn(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    status: Optional[str] = None


class NotificationIn(BaseModel):
    title: str
    body: str
    icon: Optional[str] = "bell"
    link: Optional[str] = ""
    target_type: str = "all"  # all | group | user
    target_id: Optional[str] = None


class ReportActionIn(BaseModel):
    action: str  # accept | reject | block


class SettingsIn(BaseModel):
    app_name: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    terms: Optional[str] = None
    privacy: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    max_file_size_mb: Optional[int] = None


class WebsiteEventIn(BaseModel):
    event: Literal["pageview", "heartbeat"] = "pageview"
    visitor_id: str = Field(min_length=8, max_length=80, pattern=r"^[A-Za-z0-9_-]+$")
    session_id: str = Field(min_length=8, max_length=80, pattern=r"^[A-Za-z0-9_-]+$")
    path: str = Field(default="/", max_length=300)
    referrer: str = Field(default="", max_length=500)
    language: str = Field(default="", max_length=40)
    timezone: str = Field(default="", max_length=80)
    country: str = Field(default="", max_length=8)
    screen: str = Field(default="", max_length=40)


class ContactSupportIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=4, max_length=160)
    category: Literal["account", "technical", "billing", "security", "feedback", "other"] = "other"
    message: str = Field(min_length=20, max_length=5000)
    app_platform: Optional[Literal["ios", "android", "web", "desktop", "unknown"]] = "unknown"
    app_version: Optional[str] = Field(default="", max_length=40)
    website: Optional[str] = Field(default="", max_length=120)
    submitted_after_ms: Optional[int] = Field(default=0, ge=0, le=600000)


class SupportTicketUpdateIn(BaseModel):
    status: Optional[Literal["new", "open", "waiting", "resolved", "closed"]] = None
    priority: Optional[Literal["low", "normal", "high", "urgent"]] = None
    assigned_to: Optional[str] = Field(default=None, max_length=120)
    admin_note: Optional[str] = Field(default=None, max_length=4000)


# ----- helpers -----
def _client_ip(request: Request) -> str:
    peer = request.client.host if request.client else ""
    if peer in {"127.0.0.1", "::1"}:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return peer or "unknown"


async def _enforce_rate_limit(
    scope: str,
    identifier: str,
    *,
    limit: int,
    window_seconds: int,
) -> None:
    now = datetime.now(timezone.utc)
    bucket = int(now.timestamp()) // window_seconds
    digest = hashlib.sha256(identifier.encode("utf-8")).hexdigest()
    key = f"{scope}:{digest}:{bucket}"
    try:
        row = await db.rate_limits.find_one_and_update(
            {"key": key},
            {
                "$inc": {"count": 1},
                "$setOnInsert": {
                    "key": key,
                    "scope": scope,
                    "expires_at": now + timedelta(seconds=window_seconds * 2),
                },
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError:
        row = await db.rate_limits.find_one_and_update(
            {"key": key},
            {"$inc": {"count": 1}},
            return_document=ReturnDocument.AFTER,
        )
    if row and row.get("count", 0) > limit:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Try again later.",
            headers={"Retry-After": str(window_seconds)},
        )


def _cookie_secure() -> bool:
    configured = os.environ.get("COOKIE_SECURE")
    if configured is not None:
        return configured.lower() in {"1", "true", "yes"}
    return os.environ.get("FRONTEND_URL", "").lower().startswith("https://")


def _set_cookies(response: Response, access: str, refresh: str):
    secure = _cookie_secure()
    response.set_cookie("access_token", access, httponly=True, secure=secure, samesite="strict", max_age=60 * 60 * 12, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=secure, samesite="strict", max_age=60 * 60 * 24 * 7, path="/")


async def _revoke_token(raw_token: Optional[str]) -> None:
    token = (raw_token or "").strip()
    if not token:
        return
    try:
        payload = decode_token(token)
    except Exception:
        return
    jti = payload.get("jti")
    expires_at = payload.get("exp")
    if not jti or not expires_at:
        return
    try:
        expiry = datetime.fromtimestamp(expires_at, tz=timezone.utc)
    except Exception:
        return
    await db.revoked_tokens.update_one(
        {"jti": jti},
        {"$set": {"jti": jti, "expires_at": expiry}},
        upsert=True,
    )


def _origin_allowed(origin: str) -> bool:
    return not origin or origin in _origins


def _public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "role": u.get("role", "user"),
        "status": u.get("status", "active"),
        "avatar": u.get("avatar", ""),
        "created_at": u.get("created_at"),
        "last_active": u.get("last_active"),
    }


def _upstream_detail(exc: httpx.HTTPStatusError) -> str:
    try:
        detail = exc.response.json().get("detail")
    except Exception:
        detail = None
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list):
        return " ".join(str(item.get("msg", item)) for item in detail if item)
    return exc.response.text or "Błąd API aplikacji"


async def _mirror_app_user(app_user: dict) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    email = (app_user.get("email") or "").lower()
    existing = await db.users.find_one({"email": email}) if email else None
    doc = {
        "id": app_user.get("id") or (existing or {}).get("id") or str(uuid.uuid4()),
        "name": app_user.get("name") or email,
        "email": email,
        "role": app_user.get("role", "user"),
        "status": "blocked" if app_user.get("status") == "blocked" else "active",
        "avatar": app_user.get("avatar") or "",
        "created_at": app_user.get("created_at") or (existing or {}).get("created_at") or now,
        "last_active": app_user.get("last_active") or app_user.get("last_seen") or now,
        "app_user_id": app_user.get("id"),
        "username": app_user.get("username", ""),
        "title": app_user.get("title", ""),
    }
    await db.users.update_one(
        {"email": email},
        {"$set": doc, "$unset": {"password_hash": ""}},
        upsert=True,
    )
    return doc


def _website_client_info(request: Request) -> tuple[str, str]:
    user_agent = request.headers.get("user-agent", "").lower()
    if "edg/" in user_agent:
        browser = "Edge"
    elif "firefox/" in user_agent:
        browser = "Firefox"
    elif "chrome/" in user_agent or "crios/" in user_agent:
        browser = "Chrome"
    elif "safari/" in user_agent:
        browser = "Safari"
    else:
        browser = "Other"

    if any(value in user_agent for value in ("mobile", "android", "iphone")):
        device = "Mobile"
    elif any(value in user_agent for value in ("ipad", "tablet")):
        device = "Tablet"
    else:
        device = "Desktop"
    return browser, device


def _website_country(request: Request, reported_country: str) -> str:
    for header in (
        "cf-ipcountry",
        "x-vercel-ip-country",
        "cloudfront-viewer-country",
        "x-country-code",
    ):
        value = request.headers.get(header, "").strip().upper()
        if len(value) == 2 and value.isalpha():
            return value
    value = reported_country.strip().upper()
    return value if len(value) == 2 and value.isalpha() else "UNKNOWN"


def _support_public_id(now: datetime) -> str:
    return f"GST-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


def _support_priority(category: str, subject: str, message: str) -> str:
    text = f"{subject} {message}".lower()
    urgent_terms = ("urgent", "pilne", "natychmiast", "security", "hack", "wlam", "breach", "leak")
    high_terms = ("logowanie", "login", "platnosc", "payment", "crash", "nie dziala", "call", "polaczen")
    if category == "security" or any(term in text for term in urgent_terms):
        return "high"
    if any(term in text for term in high_terms):
        return "normal"
    return "normal"


def _support_public_doc(doc: dict) -> dict:
    doc.pop("_id", None)
    doc.pop("ip_hash", None)
    return doc


async def _check_status_service(client: httpx.AsyncClient, service: dict) -> dict:
    started = time.perf_counter()
    try:
        response = await client.request(service["method"], service["url"])
        latency_ms = round((time.perf_counter() - started) * 1000)
        return {
            "key": service["key"],
            "name": service["name"],
            "url": service["url"],
            "ok": response.status_code < 400,
            "status": response.status_code,
            "latency_ms": latency_ms,
        }
    except Exception as exc:
        latency_ms = round((time.perf_counter() - started) * 1000)
        return {
            "key": service["key"],
            "name": service["name"],
            "url": service["url"],
            "ok": False,
            "status": "error",
            "latency_ms": latency_ms,
            "error": str(exc),
        }


async def _public_service_status() -> dict:
    services = [
        {
            "key": "website",
            "name": "ghostel.app website",
            "url": os.environ.get("PUBLIC_WEBSITE_URL", "https://ghostel.app"),
            "method": "HEAD",
        },
        {
            "key": "mobile_api",
            "name": "Mobile app API",
            "url": os.environ.get("GHOSTEL_MOBILE_API_URL", "https://api.ghostel.app/api/"),
            "method": "GET",
        },
        {
            "key": "panel_api",
            "name": "Website panel API",
            "url": os.environ.get("PANEL_API_URL", "https://panel-api.ghostel.app/api/"),
            "method": "GET",
        },
    ]
    async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as http_client:
        rows = await asyncio.gather(
            *[_check_status_service(http_client, service) for service in services]
        )

    if all(row["ok"] for row in rows):
        overall = "operational"
    elif any(row["ok"] for row in rows):
        overall = "degraded"
    else:
        overall = "outage"

    incidents = await db.status_incidents.find(
        {"public": {"$ne": False}},
        {"_id": 0},
    ).sort("updated_at", -1).limit(10).to_list(10)

    return {
        "overall_status": overall,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "services": rows,
        "incidents": incidents,
    }


async def _website_analytics() -> dict:
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    active_since = now - timedelta(minutes=5)
    thirty_days_ago = now - timedelta(days=29)

    total_pageviews = await db.website_pageviews.count_documents({})
    pageviews_today = await db.website_pageviews.count_documents({"created_at": {"$gte": today}})
    total_visitors = len(await db.website_sessions.distinct("visitor_id"))
    active_now = len(
        await db.website_sessions.distinct("visitor_id", {"last_seen_at": {"$gte": active_since}})
    )

    duration_rows = await db.website_sessions.aggregate(
        [
            {"$project": {"duration": {"$subtract": ["$last_seen_at", "$first_seen_at"]}}},
            {"$group": {"_id": None, "average": {"$avg": "$duration"}}},
        ]
    ).to_list(1)
    average_duration_seconds = round((duration_rows[0]["average"] or 0) / 1000) if duration_rows else 0

    async def grouped(collection, field: str, limit: int = 8) -> list[dict]:
        return await collection.aggregate(
            [
                {"$match": {field: {"$nin": [None, ""]}}},
                {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": limit},
                {"$project": {"_id": 0, "name": "$_id", "count": 1}},
            ]
        ).to_list(limit)

    daily_rows = await db.website_pageviews.aggregate(
        [
            {"$match": {"created_dt": {"$gte": thirty_days_ago}}},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_dt"}},
                    "pageviews": {"$sum": 1},
                    "visitors": {"$addToSet": "$visitor_id"},
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "day": "$_id",
                    "pageviews": 1,
                    "visitors": {"$size": "$visitors"},
                }
            },
        ]
    ).to_list(31)

    daily_map = {row["day"]: row for row in daily_rows}
    daily = []
    for offset in range(29, -1, -1):
        day = (now - timedelta(days=offset)).strftime("%Y-%m-%d")
        daily.append(daily_map.get(day, {"day": day, "pageviews": 0, "visitors": 0}))

    return {
        "total_pageviews": total_pageviews,
        "pageviews_today": pageviews_today,
        "total_visitors": total_visitors,
        "active_now": active_now,
        "average_duration_seconds": average_duration_seconds,
        "daily": daily,
        "countries": await grouped(db.website_sessions, "country", 10),
        "top_pages": await grouped(db.website_pageviews, "path", 10),
        "referrers": await grouped(db.website_sessions, "referrer_host", 8),
        "devices": await grouped(db.website_sessions, "device", 5),
        "browsers": await grouped(db.website_sessions, "browser", 8),
    }


# ----- Health -----
@api.get("/")
async def root():
    return {"message": "ghostel.app API ready", "version": "1.0"}


@api.post("/analytics/event", status_code=204)
async def website_event(payload: WebsiteEventIn, request: Request):
    await _enforce_rate_limit(
        "analytics-ip", _client_ip(request), limit=180, window_seconds=60
    )
    await _enforce_rate_limit(
        "analytics-session", payload.session_id, limit=12, window_seconds=60
    )
    if payload.event == "pageview":
        await _enforce_rate_limit(
            "analytics-pageview-session",
            payload.session_id,
            limit=30,
            window_seconds=10 * 60,
        )
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    expires_at = now + timedelta(days=180)
    browser, device = _website_client_info(request)
    country = _website_country(request, payload.country)
    referrer_host = urlparse(payload.referrer).hostname or "Direct"
    path = payload.path.split("?")[0][:300] or "/"

    await db.website_sessions.update_one(
        {"session_id": payload.session_id},
        {
            "$setOnInsert": {
                "session_id": payload.session_id,
                "visitor_id": payload.visitor_id,
                "first_seen_at": now,
                "created_at": now_iso,
                "referrer": payload.referrer,
                "referrer_host": referrer_host,
            },
            "$set": {
                "last_seen_at": now,
                "expires_at": expires_at,
                "last_seen": now_iso,
                "path": path,
                "country": country,
                "language": payload.language,
                "timezone": payload.timezone,
                "screen": payload.screen,
                "browser": browser,
                "device": device,
            },
        },
        upsert=True,
    )

    if payload.event == "pageview":
        await db.website_pageviews.insert_one(
            {
                "visitor_id": payload.visitor_id,
                "session_id": payload.session_id,
                "path": path,
                "country": country,
                "browser": browser,
                "device": device,
                "created_dt": now,
                "created_at": now_iso,
                "expires_at": expires_at,
            }
        )
    return Response(status_code=204)


# ----- Contact support -----
@api.post("/contact")
async def create_support_ticket(payload: ContactSupportIn, request: Request):
    ip = _client_ip(request)
    email = payload.email.lower().strip()
    await _enforce_rate_limit("support-ip", ip, limit=6, window_seconds=60 * 60)
    await _enforce_rate_limit("support-email", email, limit=3, window_seconds=60 * 60)

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    if (payload.website or "").strip():
        return {"ok": True, "ticket_id": _support_public_id(now), "status": "new"}
    if payload.submitted_after_ms and payload.submitted_after_ms < 1500:
        raise HTTPException(status_code=400, detail="Please wait a moment before submitting the form.")
    ticket_id = str(uuid.uuid4())
    public_id = _support_public_id(now)
    priority = _support_priority(payload.category, payload.subject, payload.message)
    doc = {
        "id": ticket_id,
        "public_id": public_id,
        "name": payload.name.strip(),
        "email": email,
        "subject": payload.subject.strip(),
        "category": payload.category,
        "message": payload.message.strip(),
        "app_platform": payload.app_platform or "unknown",
        "app_version": (payload.app_version or "").strip(),
        "status": "new",
        "priority": priority,
        "source": "website",
        "assigned_to": "",
        "admin_note": "",
        "history": [
            {
                "at": now_iso,
                "actor": "system",
                "action": "created",
                "changes": {"status": "new", "priority": priority},
            }
        ],
        "user_agent": request.headers.get("user-agent", "")[:500],
        "ip_hash": hashlib.sha256(ip.encode("utf-8")).hexdigest(),
        "created_at": now_iso,
        "updated_at": now_iso,
        "resolved_at": None,
    }
    await db.support_tickets.insert_one(doc)
    return {"ok": True, "ticket_id": public_id, "status": "new"}


@api.get("/status")
async def public_status():
    return await _public_service_status()


# ----- Auth -----
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response, request: Request):
    email = payload.email.lower().strip()
    await _enforce_rate_limit(
        "auth-register-ip", _client_ip(request), limit=10, window_seconds=60 * 60
    )
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email już zarejestrowany")

    if ghostel_client.has_public_api:
        try:
            app_data = await ghostel_client.public_register(
                email=email,
                password=payload.password,
                name=payload.name,
                title=payload.title or "",
                username=payload.username,
            )
        except httpx.HTTPStatusError as e:
            detail = _upstream_detail(e)
            if e.response.status_code == 400 and "registered" in detail.lower():
                detail = "Email jest już zarejestrowany w aplikacji. Zaloguj się zamiast zakładać konto."
            raise HTTPException(status_code=e.response.status_code, detail=detail)
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Nie można połączyć się z API aplikacji. Spróbuj ponownie za chwilę.")
        app_user = app_data.get("user")
        if not app_user:
            raise HTTPException(status_code=502, detail="API aplikacji nie zwróciło danych użytkownika")
        doc = await _mirror_app_user(app_user)
    else:
        user_id = str(uuid.uuid4())
        doc = {
            "id": user_id,
            "name": payload.name,
            "email": email,
            "password_hash": hash_password(payload.password),
            "role": "user",
            "status": "active",
            "avatar": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_active": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)

    access = create_access_token(doc["id"], email, doc.get("role", "user"))
    refresh = create_refresh_token(doc["id"])
    _set_cookies(response, access, refresh)
    out = _public_user(doc)
    out["access_token"] = access
    return out


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response, request: Request):
    email = payload.email.lower().strip()
    await _enforce_rate_limit(
        "auth-login-ip", _client_ip(request), limit=30, window_seconds=5 * 60
    )
    await _enforce_rate_limit(
        "auth-login-email", email, limit=10, window_seconds=5 * 60
    )
    user = await db.users.find_one({"email": email})
    if ghostel_client.has_public_api:
        # The app backend is authoritative for passwords, roles and 2FA.
        user = None
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        if ghostel_client.has_public_api:
            try:
                app_data = await ghostel_client.public_login(
                    email, payload.password, payload.totp_code
                )
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=401, detail=_upstream_detail(e))
            except httpx.RequestError:
                if user:
                    raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")
                raise HTTPException(status_code=503, detail="Nie można połączyć się z API aplikacji. Spróbuj ponownie za chwilę.")
            if app_data.get("requires_2fa"):
                return {"requires_2fa": True}
            app_user = app_data.get("user")
            if not app_user:
                raise HTTPException(status_code=502, detail="API aplikacji nie zwróciło danych użytkownika")
            user = await _mirror_app_user(app_user)
        else:
            raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")
    if user.get("status") == "blocked":
        raise HTTPException(status_code=403, detail="Konto zablokowane")
    access = create_access_token(user["id"], email, user.get("role", "user"))
    refresh = create_refresh_token(user["id"])
    _set_cookies(response, access, refresh)
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_active": datetime.now(timezone.utc).isoformat()}})
    out = _public_user(user)
    out["access_token"] = access
    return out


@api.post("/auth/logout")
async def logout(response: Response, request: Request):
    await _revoke_token(extract_token(request))
    await _revoke_token(request.cookies.get("refresh_token"))
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(request: Request):
    user = await get_current_user(request, db)
    return _public_user(user)


# ----- Admin: Dashboard -----
def _ghostel_user_to_public(u: dict) -> dict:
    return {
        "id": u.get("id"),
        "name": u.get("name") or u.get("username") or u.get("email"),
        "email": u.get("email"),
        "role": u.get("role", "user"),
        "status": "blocked" if u.get("status") == "blocked" else "active",
        "online": u.get("status") == "online",
        "avatar": u.get("avatar"),
        "avatar_color": u.get("avatar_color"),
        "title": u.get("title"),
        "bio": u.get("bio"),
        "two_factor_enabled": u.get("two_factor_enabled", False),
        "push_registered": u.get("push_registered", False),
        "created_at": u.get("created_at"),
        "last_active": u.get("last_seen") or u.get("last_active"),
    }


def _build_charts(users: list):
    """Build 14-day activity/registration charts from real user list."""
    now = datetime.now(timezone.utc)
    days = []
    for d in range(13, -1, -1):
        day = now - timedelta(days=d)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        days.append((day.strftime("%d.%m"), start, end))

    def parse(dt_str):
        if not dt_str:
            return None
        try:
            return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        except Exception:
            return None

    regs_by_day = {label: 0 for label, _, _ in days}
    active_by_day = {label: 0 for label, _, _ in days}
    for u in users:
        ca = parse(u.get("created_at"))
        ls = parse(u.get("last_seen") or u.get("last_active"))
        for label, start, end in days:
            if ca and start <= ca < end:
                regs_by_day[label] += 1
            if ls and start <= ls < end:
                active_by_day[label] += 1

    registrations_chart = [{"day": l, "count": regs_by_day[l]} for l, _, _ in days]
    activity_chart = [{"day": l, "active": active_by_day[l]} for l, _, _ in days]
    return activity_chart, registrations_chart


@api.get("/admin/dashboard")
async def admin_dashboard(request: Request):
    await require_admin(request, db)
    website_analytics = await _website_analytics()
    stats = None
    users = []
    source = "local"
    if ghostel_client.is_configured:
        try:
            stats = await ghostel_client.stats()
            users = await ghostel_client.users()
            source = "ghostel"
        except Exception as e:
            logger.warning(f"ghostel.app API unreachable, falling back to local: {e}")

    if source == "ghostel":
        public_users = [_ghostel_user_to_public(u) for u in users]
        activity_chart, registrations_chart = _build_charts(users)
        # messages chart synthesized — ghostel.app exposes only total, not per-day
        total_msgs = stats.get("messages", 0)
        per_day_baseline = max(1, total_msgs // 14)
        messages_chart = [
            {"day": d["day"], "count": per_day_baseline + (i * 3 % 7)}
            for i, d in enumerate(registrations_chart)
        ]
        recent_activity = sorted(
            public_users, key=lambda u: u.get("last_active") or "", reverse=True
        )[:5]
        out_stats = {
            "total_users": stats.get("users", 0),
            "active_users": stats.get("online", 0),
            "total_messages": stats.get("messages", 0),
            "total_groups": stats.get("conversations", 0),
            "pending_reports": await db.reports.count_documents({"status": "pending"}),
            "two_factor_enabled": stats.get("two_factor_enabled", 0),
            "push_ready": stats.get("push_ready", 0),
        }
        return {
            "source": source,
            "stats": out_stats,
            "activity_chart": activity_chart,
            "registrations_chart": registrations_chart,
            "messages_chart": messages_chart,
            "recent_activity": recent_activity,
            "website_analytics": website_analytics,
        }

    # Fallback local
    now = datetime.now(timezone.utc)
    total_users = await db.users.count_documents({})
    week_ago = (now - timedelta(days=7)).isoformat()
    active_users = await db.users.count_documents({"last_active": {"$gte": week_ago}})
    total_messages = await db.messages.count_documents({})
    total_groups = await db.groups.count_documents({})
    pending_reports = await db.reports.count_documents({"status": "pending"})
    activity, registrations, messages_chart = [], [], []
    for d in range(13, -1, -1):
        day = now - timedelta(days=d)
        day_str = day.strftime("%d.%m")
        activity.append({"day": day_str, "active": 20})
        registrations.append({"day": day_str, "count": 0})
        messages_chart.append({"day": day_str, "count": 50 + d * 7})
    recent_users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).limit(5).to_list(5)
    return {
        "source": source,
        "stats": {
            "total_users": total_users,
            "active_users": active_users,
            "total_messages": total_messages,
            "total_groups": total_groups,
            "pending_reports": pending_reports,
            "two_factor_enabled": 0,
            "push_ready": 0,
        },
        "activity_chart": activity,
        "registrations_chart": registrations,
        "messages_chart": messages_chart,
        "recent_activity": [_public_user(u) for u in recent_users],
        "website_analytics": website_analytics,
    }


# ----- Admin: Users -----
@api.get("/admin/users")
async def list_users(request: Request, q: str = "", role: str = "", status: str = ""):
    await require_admin(request, db)
    if ghostel_client.is_configured:
        try:
            users_raw = await ghostel_client.users()
            public = [_ghostel_user_to_public(u) for u in users_raw]
            # apply filters
            if q:
                ql = q.lower()
                public = [u for u in public if ql in (u.get("name") or "").lower() or ql in (u.get("email") or "").lower()]
            if role:
                public = [u for u in public if u.get("role") == role]
            if status:
                public = [u for u in public if u.get("status") == status]
            public.sort(key=lambda u: u.get("created_at") or "", reverse=True)
            return public
        except Exception as e:
            logger.warning(f"ghostel.app list_users fallback: {e}")
    query = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]
    if role:
        query["role"] = role
    if status:
        query["status"] = status
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return [_public_user(u) for u in users]


@api.get("/admin/users/{user_id}")
async def get_user_detail(user_id: str, request: Request):
    await require_admin(request, db)
    if ghostel_client.is_configured:
        try:
            users_raw = await ghostel_client.users()
            for u in users_raw:
                if u.get("id") == user_id:
                    return _ghostel_user_to_public(u)
        except Exception:
            pass
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    return _public_user(user)


@api.patch("/admin/users/{user_id}")
async def update_user(user_id: str, payload: UpdateUserIn, request: Request):
    await require_admin(request, db)
    # Upstream ghostel.app API does not expose PATCH on users — return current data with note
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Brak danych do aktualizacji")
    if ghostel_client.is_configured:
        try:
            users_raw = await ghostel_client.users()
            for u in users_raw:
                if u.get("id") == user_id:
                    pub = _ghostel_user_to_public(u)
                    raise HTTPException(
                        status_code=501,
                        detail=f"Edycja użytkownika niedostępna w ghostel.app API (read-only). Użytkownik: {pub['email']}",
                    )
        except HTTPException:
            raise
        except Exception:
            pass
    # fallback to local update
    result = await db.users.update_one({"id": user_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return _public_user(user)


@api.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    admin = await require_admin(request, db)
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Nie można usunąć własnego konta")
    if ghostel_client.is_configured:
        try:
            ok = await ghostel_client.delete_user(user_id)
            if ok:
                return {"ok": True, "source": "ghostel"}
        except Exception as e:
            logger.warning(f"ghostel.app delete_user error: {e}")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    return {"ok": True, "source": "local"}


# ----- Admin: Groups -----
@api.get("/admin/groups")
async def list_groups(request: Request, q: str = ""):
    await require_admin(request, db)
    query = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    groups = await db.groups.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return groups


@api.post("/admin/groups")
async def create_group(payload: GroupCreateIn, request: Request):
    await require_admin(request, db)
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "description": payload.description or "",
        "visibility": payload.visibility,
        "members_count": 0,
        "member_ids": [],
        "owner_id": None,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.groups.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/admin/groups/{group_id}")
async def update_group(group_id: str, payload: GroupUpdateIn, request: Request):
    await require_admin(request, db)
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Brak danych")
    result = await db.groups.update_one({"id": group_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Grupa nie znaleziona")
    group = await db.groups.find_one({"id": group_id}, {"_id": 0})
    return group


@api.delete("/admin/groups/{group_id}")
async def delete_group(group_id: str, request: Request):
    await require_admin(request, db)
    result = await db.groups.delete_one({"id": group_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Grupa nie znaleziona")
    return {"ok": True}


# ----- Admin: Moderation -----
@api.get("/admin/reports")
async def list_reports(request: Request, status: str = ""):
    await require_admin(request, db)
    query = {}
    if status:
        query["status"] = status
    reports = await db.reports.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return reports


@api.post("/admin/reports/{report_id}/action")
async def report_action(report_id: str, payload: ReportActionIn, request: Request):
    await require_admin(request, db)
    report = await db.reports.find_one({"id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Zgłoszenie nie znalezione")
    new_status = {"accept": "accepted", "reject": "rejected", "block": "blocked"}.get(payload.action)
    if not new_status:
        raise HTTPException(status_code=400, detail="Nieprawidłowa akcja")
    await db.reports.update_one({"id": report_id}, {"$set": {"status": new_status, "resolved_at": datetime.now(timezone.utc).isoformat()}})
    return {"ok": True, "status": new_status}


# ----- Admin: Notifications -----
@api.get("/admin/notifications")
async def list_notifications(request: Request):
    await require_admin(request, db)
    notifications = await db.notifications.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return notifications


@api.post("/admin/notifications")
async def send_notification(payload: NotificationIn, request: Request):
    await require_admin(request, db)
    # determine recipients count
    if payload.target_type == "all":
        recipients = await db.users.count_documents({})
    elif payload.target_type == "group":
        g = await db.groups.find_one({"id": payload.target_id})
        recipients = g.get("members_count", 0) if g else 0
    else:
        recipients = 1 if await db.users.find_one({"id": payload.target_id}) else 0
    doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "body": payload.body,
        "icon": payload.icon,
        "link": payload.link,
        "target_type": payload.target_type,
        "target_id": payload.target_id,
        "recipients": recipients,
        "status": "sent",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.notifications.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ----- Admin: Settings -----
@api.get("/admin/settings")
async def get_settings(request: Request):
    await require_admin(request, db)
    s = await db.settings.find_one({"key": "app_settings"}, {"_id": 0})
    return s or {}


@api.patch("/admin/settings")
async def update_settings(payload: SettingsIn, request: Request):
    await require_admin(request, db)
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.settings.update_one({"key": "app_settings"}, {"$set": update}, upsert=True)
    s = await db.settings.find_one({"key": "app_settings"}, {"_id": 0})
    return s


# ----- Admin: Contact support -----
@api.get("/admin/support")
async def list_support_tickets(
    request: Request,
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None, max_length=120),
):
    await require_admin(request, db)
    query: dict = {}
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority"] = priority
    if category and category != "all":
        query["category"] = category
    if q:
        needle = q.strip()
        if needle:
            pattern = re.escape(needle)
            query["$or"] = [
                {"public_id": {"$regex": pattern, "$options": "i"}},
                {"name": {"$regex": pattern, "$options": "i"}},
                {"email": {"$regex": pattern, "$options": "i"}},
                {"subject": {"$regex": pattern, "$options": "i"}},
                {"message": {"$regex": pattern, "$options": "i"}},
            ]

    tickets = await db.support_tickets.find(query, {"_id": 0, "ip_hash": 0}).sort("created_at", -1).to_list(500)
    summary = {
        "total": await db.support_tickets.count_documents({}),
        "new": await db.support_tickets.count_documents({"status": "new"}),
        "open": await db.support_tickets.count_documents({"status": {"$in": ["new", "open", "waiting"]}}),
        "resolved": await db.support_tickets.count_documents({"status": {"$in": ["resolved", "closed"]}}),
        "urgent": await db.support_tickets.count_documents({"priority": "urgent"}),
        "high": await db.support_tickets.count_documents({"priority": "high"}),
    }
    return {"items": tickets, "summary": summary}


@api.get("/admin/support/{ticket_id}")
async def get_support_ticket(ticket_id: str, request: Request):
    await require_admin(request, db)
    ticket = await db.support_tickets.find_one(
        {"$or": [{"id": ticket_id}, {"public_id": ticket_id}]},
        {"_id": 0, "ip_hash": 0},
    )
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    return ticket


@api.patch("/admin/support/{ticket_id}")
async def update_support_ticket(ticket_id: str, payload: SupportTicketUpdateIn, request: Request):
    admin = await require_admin(request, db)
    current = await db.support_tickets.find_one({"$or": [{"id": ticket_id}, {"public_id": ticket_id}]})
    if not current:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    incoming = payload.model_dump()
    update = {k: v for k, v in incoming.items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No changes provided")

    now_iso = datetime.now(timezone.utc).isoformat()
    update["updated_at"] = now_iso
    if update.get("status") in {"resolved", "closed"}:
        update["resolved_at"] = now_iso
    elif update.get("status") in {"new", "open", "waiting"}:
        update["resolved_at"] = None

    changes = {
        key: {"from": current.get(key), "to": value}
        for key, value in update.items()
        if key != "updated_at" and current.get(key) != value
    }
    if not changes:
        ticket = _support_public_doc(current)
        return ticket

    history_entry = {
        "at": now_iso,
        "actor": admin.get("email") or admin.get("id") or "admin",
        "action": "updated",
        "changes": changes,
    }
    ticket = await db.support_tickets.find_one_and_update(
        {"id": current["id"]},
        {"$set": update, "$push": {"history": history_entry}},
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0, "ip_hash": 0},
    )
    return ticket


# ----- Admin: Reports / CSV export -----
@api.get("/admin/export/{kind}")
async def export_csv(kind: str, request: Request):
    await require_admin(request, db)
    output = io.StringIO()
    writer = csv.writer(output)
    if kind == "users":
        writer.writerow(["id", "name", "email", "role", "status", "created_at", "last_active"])
        users = None
        if ghostel_client.is_configured:
            try:
                users_raw = await ghostel_client.users()
                users = [_ghostel_user_to_public(u) for u in users_raw]
            except Exception:
                users = None
        if users is None:
            users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(2000)
        for u in users:
            writer.writerow([u.get("id"), u.get("name"), u.get("email"), u.get("role"), u.get("status"), u.get("created_at"), u.get("last_active")])
    elif kind == "groups":
        writer.writerow(["id", "name", "visibility", "members_count", "status", "created_at"])
        groups = await db.groups.find({}, {"_id": 0}).to_list(2000)
        for g in groups:
            writer.writerow([g.get("id"), g.get("name"), g.get("visibility"), g.get("members_count"), g.get("status"), g.get("created_at")])
    elif kind == "reports":
        writer.writerow(["id", "type", "target", "reporter", "reason", "status", "created_at"])
        reports = await db.reports.find({}, {"_id": 0}).to_list(2000)
        for r in reports:
            writer.writerow([r.get("id"), r.get("type"), r.get("target"), r.get("reporter"), r.get("reason"), r.get("status"), r.get("created_at")])
    elif kind == "support":
        writer.writerow(["public_id", "name", "email", "category", "subject", "status", "priority", "assigned_to", "created_at", "updated_at"])
        tickets = await db.support_tickets.find({}, {"_id": 0, "ip_hash": 0, "message": 0, "history": 0}).sort("created_at", -1).to_list(5000)
        for t in tickets:
            writer.writerow([
                t.get("public_id"),
                t.get("name"),
                t.get("email"),
                t.get("category"),
                t.get("subject"),
                t.get("status"),
                t.get("priority"),
                t.get("assigned_to"),
                t.get("created_at"),
                t.get("updated_at"),
            ])
    elif kind == "activity":
        writer.writerow(["user_id", "name", "email", "last_active"])
        users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("last_active", -1).to_list(2000)
        for u in users:
            writer.writerow([u.get("id"), u.get("name"), u.get("email"), u.get("last_active")])
    else:
        raise HTTPException(status_code=400, detail="Nieznany typ raportu")

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ghostel-{kind}.csv"},
    )


# ----- Mount router & middleware -----
app.include_router(api)

_frontend = os.environ.get("FRONTEND_URL", "http://localhost:3000")
_extra_origins = [
    origin.strip()
    for origin in os.environ.get("ADDITIONAL_CORS_ORIGINS", "").split(",")
    if origin.strip()
]
_origins = list({
    _frontend,
    "http://localhost:3000",
    "https://ghostel.app",
    "https://www.ghostel.app",
    *_extra_origins,
})
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        origin = request.headers.get("origin", "")
        if origin and not _origin_allowed(origin):
            return JSONResponse(status_code=403, content={"detail": "Origin not allowed"})
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    if request.url.path.startswith(("/api/auth", "/api/admin", "/api/contact")):
        response.headers["Cache-Control"] = "no-store"
    return response


# ----- Startup -----
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.groups.create_index("id", unique=True)
    await db.messages.create_index("created_at")
    await db.website_sessions.create_index("session_id", unique=True)
    await db.website_sessions.create_index("visitor_id")
    await db.website_sessions.create_index("last_seen_at")
    await db.website_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.website_pageviews.create_index("created_dt")
    await db.website_pageviews.create_index("path")
    await db.website_pageviews.create_index("expires_at", expireAfterSeconds=0)
    await db.rate_limits.create_index("key", unique=True)
    await db.rate_limits.create_index("expires_at", expireAfterSeconds=0)
    await db.revoked_tokens.create_index("jti", unique=True)
    await db.revoked_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.support_tickets.create_index("id", unique=True)
    await db.support_tickets.create_index("public_id", unique=True)
    await db.support_tickets.create_index("email")
    await db.support_tickets.create_index("status")
    await db.support_tickets.create_index("priority")
    await db.support_tickets.create_index("category")
    await db.support_tickets.create_index("created_at")
    await db.status_incidents.create_index("updated_at")
    await db.status_incidents.create_index("public")
    # seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@ghostel.app").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_password:
        raise RuntimeError("ADMIN_PASSWORD environment variable is required")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Administrator",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "status": "active",
            "avatar": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_active": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    if os.environ.get("SEED_SAMPLE_DATA", "").lower() in {"1", "true", "yes"}:
        await seed_sample_data(db)
    logger.info("ghostel.app startup complete")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
