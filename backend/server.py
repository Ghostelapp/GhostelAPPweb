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
from typing import Any, Optional, List, Literal

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


class ReleaseCreateIn(BaseModel):
    platform: Literal["android", "ios", "website", "backend", "desktop"]
    version: str = Field(min_length=1, max_length=40)
    build_number: Optional[str] = Field(default="", max_length=40)
    title: Optional[str] = Field(default="", max_length=140)
    status: Literal["draft", "testing", "published", "rollback"] = "draft"
    download_url: Optional[str] = Field(default="", max_length=500)
    release_url: Optional[str] = Field(default="", max_length=500)
    commit_sha: Optional[str] = Field(default="", max_length=80)
    notes: Optional[str] = Field(default="", max_length=4000)
    current: bool = False
    public: bool = True
    published_at: Optional[str] = Field(default=None, max_length=80)


class ReleaseUpdateIn(BaseModel):
    platform: Optional[Literal["android", "ios", "website", "backend", "desktop"]] = None
    version: Optional[str] = Field(default=None, min_length=1, max_length=40)
    build_number: Optional[str] = Field(default=None, max_length=40)
    title: Optional[str] = Field(default=None, max_length=140)
    status: Optional[Literal["draft", "testing", "published", "rollback"]] = None
    download_url: Optional[str] = Field(default=None, max_length=500)
    release_url: Optional[str] = Field(default=None, max_length=500)
    commit_sha: Optional[str] = Field(default=None, max_length=80)
    notes: Optional[str] = Field(default=None, max_length=4000)
    current: Optional[bool] = None
    public: Optional[bool] = None
    published_at: Optional[str] = Field(default=None, max_length=80)


class StatusIncidentCreateIn(BaseModel):
    service: Literal["general", "website", "mobile_api", "panel_api", "push", "calls", "turn", "apk"] = "general"
    title: str = Field(min_length=1, max_length=140)
    message: Optional[str] = Field(default="", max_length=2000)
    status: Literal["investigating", "identified", "monitoring", "resolved"] = "investigating"
    impact: Literal["none", "minor", "major", "critical"] = "minor"
    public: bool = True


class StatusIncidentUpdateIn(BaseModel):
    service: Optional[Literal["general", "website", "mobile_api", "panel_api", "push", "calls", "turn", "apk"]] = None
    title: Optional[str] = Field(default=None, min_length=1, max_length=140)
    message: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[Literal["investigating", "identified", "monitoring", "resolved"]] = None
    impact: Optional[Literal["none", "minor", "major", "critical"]] = None
    public: Optional[bool] = None


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
    category: Literal["account", "technical", "billing", "security", "feedback", "tester", "bug", "other"] = "other"
    message: str = Field(min_length=20, max_length=5000)
    app_platform: Optional[Literal["ios", "android", "web", "desktop", "unknown"]] = "unknown"
    app_version: Optional[str] = Field(default="", max_length=40)
    tester_platform: Optional[Literal["android", "ios"]] = None
    store_email: Optional[EmailStr] = None
    device_model: Optional[str] = Field(default="", max_length=120)
    public_reporter_name: Optional[str] = Field(default="", max_length=80)
    website: Optional[str] = Field(default="", max_length=120)
    submitted_after_ms: Optional[int] = Field(default=0, ge=0, le=600000)


class SupportTicketUpdateIn(BaseModel):
    status: Optional[Literal["new", "open", "waiting", "resolved", "closed"]] = None
    priority: Optional[Literal["low", "normal", "high", "urgent"]] = None
    assigned_to: Optional[str] = Field(default=None, max_length=120)
    admin_note: Optional[str] = Field(default=None, max_length=4000)
    bug_status: Optional[Literal["pending", "accepted", "rejected"]] = None
    bug_points: Optional[int] = Field(default=None, ge=0, le=100)
    public_reporter_name: Optional[str] = Field(default=None, max_length=80)


class ErrorLogIn(BaseModel):
    source: Literal["app", "website", "backend"] = "website"
    platform: Literal["ios", "android", "web", "desktop", "server", "unknown"] = "unknown"
    level: Literal["error", "warning", "info"] = "error"
    message: str = Field(min_length=1, max_length=1200)
    stack: Optional[str] = Field(default="", max_length=6000)
    route: Optional[str] = Field(default="", max_length=300)
    screen: Optional[str] = Field(default="", max_length=120)
    app_version: Optional[str] = Field(default="", max_length=40)
    build_number: Optional[str] = Field(default="", max_length=40)
    device_model: Optional[str] = Field(default="", max_length=120)
    os_version: Optional[str] = Field(default="", max_length=80)
    fingerprint: Optional[str] = Field(default="", max_length=120)
    context: Optional[dict[str, Any]] = Field(default_factory=dict)


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
    if category in {"tester", "bug"}:
        return "normal"
    if any(term in text for term in high_terms):
        return "normal"
    return "normal"


def _support_public_doc(doc: dict) -> dict:
    doc.pop("_id", None)
    doc.pop("ip_hash", None)
    return doc


_SENSITIVE_LOG_KEY = re.compile(
    r"(authorization|cookie|token|password|passwd|secret|private|key|jwt|bearer|"
    r"sdp|candidate|ice|audio|voice|message_text|plaintext|ciphertext|nonce|iv|"
    r"refresh|session|credential)",
    re.IGNORECASE,
)
_JWT_RE = re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")
_BEARER_RE = re.compile(r"Bearer\s+[A-Za-z0-9._~+/=-]{20,}", re.IGNORECASE)
_QUERY_SECRET_RE = re.compile(
    r"((?:[?&]|\b)(?:token|code|secret|key|password|session|jwt|auth)=)[^&\s]+",
    re.IGNORECASE,
)
_LONG_SECRET_RE = re.compile(r"\b[A-Za-z0-9_:/+=.-]{120,}\b")


def _clean_error_text(value: Any, *, max_len: int = 1200) -> str:
    text = str(value or "")
    text = _JWT_RE.sub("[redacted-jwt]", text)
    text = _BEARER_RE.sub("Bearer [redacted]", text)
    text = _QUERY_SECRET_RE.sub(r"\1[redacted]", text)
    text = _LONG_SECRET_RE.sub("[redacted-long-value]", text)
    return text[:max_len]


def _sanitize_error_context(value: Any, *, depth: int = 0) -> Any:
    if depth > 4:
        return "[truncated]"
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, str):
        return _clean_error_text(value, max_len=1000)
    if isinstance(value, list):
        return [_sanitize_error_context(item, depth=depth + 1) for item in value[:20]]
    if isinstance(value, dict):
        out: dict[str, Any] = {}
        for raw_key, raw_value in list(value.items())[:50]:
            key = str(raw_key)[:80]
            if _SENSITIVE_LOG_KEY.search(key):
                out[key] = "[redacted]"
            else:
                out[key] = _sanitize_error_context(raw_value, depth=depth + 1)
        return out
    return _clean_error_text(value, max_len=500)


def _error_fingerprint(payload: ErrorLogIn, message: str, stack: str) -> str:
    base = payload.fingerprint or "|".join(
        [
            payload.source,
            payload.platform,
            payload.level,
            message[:240],
            (payload.route or payload.screen or "")[:120],
            stack.splitlines()[0][:240] if stack else "",
        ]
    )
    return hashlib.sha256(base.encode("utf-8", errors="ignore")).hexdigest()[:32]


def _public_error_log_doc(doc: dict) -> dict:
    doc.pop("_id", None)
    doc.pop("ip_hash", None)
    return doc


def _leaderboard_prize(rank: int) -> str:
    if rank == 1:
        return "$100 BTC"
    if rank == 2:
        return "$50 BTC"
    if rank == 3:
        return "$25 BTC"
    return ""


def _safe_public_reporter_name(value: str, fallback: str) -> str:
    name = (value or fallback or "Tester").strip()
    name = re.sub(r"\s+", " ", name)
    return name[:80] or "Tester"


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


_ADMIN_OPERATIONS_HEADER_ALLOWLIST = (
    "content-length",
    "content-type",
    "content-disposition",
    "cache-control",
    "etag",
    "last-modified",
    "x-ghostel-android-version",
)


def _env_public_url(name: str, default: str) -> str:
    value = (os.environ.get(name) or default).strip()
    return value or default


def _safe_response_headers(response: httpx.Response) -> dict:
    headers = {}
    for key in _ADMIN_OPERATIONS_HEADER_ALLOWLIST:
        value = response.headers.get(key)
        if value:
            headers[key] = _clean_error_text(value, max_len=240)
    return headers


async def _admin_operations_check(client: httpx.AsyncClient, service: dict) -> dict:
    started = time.perf_counter()
    method = service.get("method", "GET")
    try:
        response = await client.request(
            method,
            service["url"],
            headers={"user-agent": "ghostel-admin-operations/1.0"},
        )
        latency_ms = round((time.perf_counter() - started) * 1000)
        return {
            "key": service["key"],
            "name": service["name"],
            "url": _clean_error_text(service["url"], max_len=300),
            "method": method,
            "ok": response.status_code < 400,
            "status": response.status_code,
            "latency_ms": latency_ms,
            "headers": _safe_response_headers(response),
        }
    except Exception as exc:
        latency_ms = round((time.perf_counter() - started) * 1000)
        return {
            "key": service["key"],
            "name": service["name"],
            "url": _clean_error_text(service["url"], max_len=300),
            "method": method,
            "ok": False,
            "status": "error",
            "latency_ms": latency_ms,
            "headers": {},
            "error": _clean_error_text(str(exc), max_len=240),
        }


async def _admin_asset_manifest(client: httpx.AsyncClient, website_url: str) -> dict:
    manifest_url = f"{website_url.rstrip('/')}/asset-manifest.json"
    try:
        response = await client.get(
            manifest_url,
            headers={"user-agent": "ghostel-admin-operations/1.0"},
        )
        latency_ms = round(response.elapsed.total_seconds() * 1000)
        response.raise_for_status()
        data = response.json()
        files = data.get("files") if isinstance(data, dict) else {}
        entrypoints = data.get("entrypoints") if isinstance(data, dict) else []
        if not isinstance(files, dict):
            files = {}
        if not isinstance(entrypoints, list):
            entrypoints = []
        return {
            "ok": True,
            "url": manifest_url,
            "status": response.status_code,
            "latency_ms": latency_ms,
            "main_js": _clean_error_text(files.get("main.js", ""), max_len=300),
            "main_css": _clean_error_text(files.get("main.css", ""), max_len=300),
            "entrypoints": [_clean_error_text(item, max_len=300) for item in entrypoints[:12]],
        }
    except Exception as exc:
        return {
            "ok": False,
            "url": manifest_url,
            "status": "error",
            "latency_ms": None,
            "main_js": "",
            "main_css": "",
            "entrypoints": [],
            "error": _clean_error_text(str(exc), max_len=240),
        }


def _safe_admin_url(value: Optional[str]) -> str:
    raw = (value or "").strip()
    if not raw:
        return ""
    parsed = urlparse(raw)
    if parsed.scheme not in {"https", "http"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")
    return _clean_error_text(raw, max_len=500)


def _release_public_doc(doc: dict) -> dict:
    doc = dict(doc or {})
    doc.pop("_id", None)
    return doc


def _default_public_releases() -> dict:
    android_url = _env_public_url("GHOSTEL_APK_URL", "https://api.ghostel.app/app-release.apk?v=1.4.54")
    android_version = (os.environ.get("GHOSTEL_ANDROID_VERSION") or "").strip()
    if not android_version:
        for part in urlparse(android_url).query.split("&"):
            key, _, value = part.partition("=")
            if key == "v" and value:
                android_version = value[:40]
                break
    android_version = android_version or "1.4.54"
    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "android": {
            "id": "default-android",
            "platform": "android",
            "version": android_version,
            "build_number": android_version.split(".")[-1],
            "title": f"Android {android_version}",
            "status": "published",
            "download_url": android_url,
            "release_url": _env_public_url(
                "GHOSTEL_RELEASE_API_URL",
                "https://api.github.com/repos/Ghostelapp/app-Gostel/releases/latest",
            ),
            "commit_sha": "",
            "notes": "Default production Android download configured on the website.",
            "current": True,
            "public": True,
            "published_at": now_iso,
            "created_at": now_iso,
            "updated_at": now_iso,
            "source": "default",
        }
    }


async def _current_public_releases() -> dict:
    rows = await db.release_records.find(
        {"public": {"$ne": False}, "current": True, "status": "published"},
        {"_id": 0},
    ).sort("published_at", -1).to_list(100)
    releases = _default_public_releases()
    for row in rows:
        platform = row.get("platform")
        if platform:
            item = _release_public_doc(row)
            item["source"] = item.get("source") or "release_center"
            releases[platform] = item
    return releases


async def _website_analytics() -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    active_since = now - timedelta(minutes=5)
    thirty_days_ago = now - timedelta(days=29)

    total_pageviews = await db.website_pageviews.count_documents({})
    pageviews_today = await db.website_pageviews.count_documents(
        {
            "$or": [
                {"created_dt": {"$gte": today_start}},
                {
                    "created_dt": {"$exists": False},
                    "created_at": {"$gte": today_start.isoformat()},
                },
            ]
        }
    )
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


@api.post("/error-logs", status_code=202)
@api.post("/logs/error", status_code=202)
async def create_error_log(payload: ErrorLogIn, request: Request):
    ip = _client_ip(request)
    await _enforce_rate_limit("error-log-ip", ip, limit=60, window_seconds=60)

    message = _clean_error_text(payload.message, max_len=1200).strip()
    if not message:
        raise HTTPException(status_code=400, detail="Error message is required")
    stack = _clean_error_text(payload.stack or "", max_len=6000)
    fingerprint = _error_fingerprint(payload, message, stack)
    await _enforce_rate_limit(
        "error-log-fingerprint",
        f"{ip}:{fingerprint}",
        limit=20,
        window_seconds=60,
    )

    now = datetime.now(timezone.utc)
    doc = {
        "id": str(uuid.uuid4()),
        "source": payload.source,
        "platform": payload.platform,
        "level": payload.level,
        "message": message,
        "stack": stack,
        "route": _clean_error_text(payload.route or "", max_len=300),
        "screen": _clean_error_text(payload.screen or "", max_len=120),
        "app_version": _clean_error_text(payload.app_version or "", max_len=40),
        "build_number": _clean_error_text(payload.build_number or "", max_len=40),
        "device_model": _clean_error_text(payload.device_model or "", max_len=120),
        "os_version": _clean_error_text(payload.os_version or "", max_len=80),
        "fingerprint": fingerprint,
        "context": _sanitize_error_context(payload.context or {}),
        "user_agent": request.headers.get("user-agent", "")[:500],
        "ip_hash": hashlib.sha256(ip.encode("utf-8")).hexdigest(),
        "created_dt": now,
        "created_at": now.isoformat(),
    }
    await db.error_logs.insert_one(doc)
    return {"ok": True, "id": doc["id"], "fingerprint": fingerprint}


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
        "tester_platform": payload.tester_platform or None,
        "store_email": str(payload.store_email or email).lower().strip(),
        "device_model": (payload.device_model or "").strip(),
        "public_reporter_name": _safe_public_reporter_name(payload.public_reporter_name or payload.name, payload.name),
        "bug_status": "pending" if payload.category == "bug" else None,
        "bug_points": 0,
        "status": "new",
        "priority": priority,
        "source": "tester_access" if payload.category in {"tester", "bug"} else "website",
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


@api.get("/releases/current")
async def public_current_releases():
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "releases": await _current_public_releases(),
    }


@api.get("/tester-leaderboard")
async def public_tester_leaderboard():
    tickets = await db.support_tickets.find(
        {"category": "bug", "bug_status": "accepted"},
        {
            "_id": 0,
            "email": 1,
            "name": 1,
            "public_reporter_name": 1,
            "bug_points": 1,
            "created_at": 1,
        },
    ).to_list(5000)

    grouped: dict[str, dict] = {}
    for ticket in tickets:
        key = (ticket.get("email") or ticket.get("public_reporter_name") or ticket.get("name") or "tester").lower()
        current = grouped.setdefault(
            key,
            {
                "name": _safe_public_reporter_name(ticket.get("public_reporter_name"), ticket.get("name")),
                "accepted_reports": 0,
                "points": 0,
                "last_report_at": ticket.get("created_at"),
            },
        )
        current["accepted_reports"] += 1
        current["points"] += int(ticket.get("bug_points") or 1)
        if ticket.get("created_at") and (not current.get("last_report_at") or ticket["created_at"] > current["last_report_at"]):
            current["last_report_at"] = ticket["created_at"]
        if ticket.get("public_reporter_name"):
            current["name"] = _safe_public_reporter_name(ticket.get("public_reporter_name"), current["name"])

    items = sorted(
        grouped.values(),
        key=lambda item: (-item["points"], -item["accepted_reports"], item.get("last_report_at") or ""),
    )[:10]
    for index, item in enumerate(items, start=1):
        item["rank"] = index
        item["prize"] = _leaderboard_prize(index)
    return {
        "items": items,
        "prizes": [
            {"rank": 1, "amount": "$100", "asset": "BTC"},
            {"rank": 2, "amount": "$50", "asset": "BTC"},
            {"rank": 3, "amount": "$25", "asset": "BTC"},
        ],
    }


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


def _parse_chart_datetime(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except Exception:
            return None
    return None


def _chart_days(days_count: int = 14):
    now = datetime.now(timezone.utc)
    days = []
    for d in range(days_count - 1, -1, -1):
        day = now - timedelta(days=d)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        days.append((day.strftime("%d.%m"), start.strftime("%Y-%m-%d"), start, end))
    return days


def _empty_chart(value_key: str, days_count: int = 14) -> list[dict]:
    return [{"day": label, value_key: 0} for label, _, _, _ in _chart_days(days_count)]


def _bucket_chart(rows: list[dict], field: str, value_key: str = "count", days_count: int = 14) -> list[dict]:
    days = _chart_days(days_count)
    counts_by_day = {key: 0 for _, key, _, _ in days}
    for row in rows:
        dt = _parse_chart_datetime(row.get(field))
        if not dt:
            continue
        for _, key, start, end in days:
            if start <= dt < end:
                counts_by_day[key] += 1
                break
    return [{"day": label, value_key: counts_by_day[key]} for label, key, _, _ in days]


async def _collection_date_chart(collection, field: str, value_key: str = "count", days_count: int = 14) -> list[dict]:
    days = _chart_days(days_count)
    start_dt = days[0][2]
    try:
        rows = await collection.aggregate(
            [
                {
                    "$project": {
                        "_chart_dt": {
                            "$cond": [
                                {"$eq": [{"$type": f"${field}"}, "date"]},
                                f"${field}",
                                {
                                    "$dateFromString": {
                                        "dateString": f"${field}",
                                        "onError": None,
                                        "onNull": None,
                                    }
                                },
                            ]
                        }
                    }
                },
                {"$match": {"_chart_dt": {"$gte": start_dt}}},
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$_chart_dt",
                                "timezone": "UTC",
                            }
                        },
                        "count": {"$sum": 1},
                    }
                },
            ]
        ).to_list(days_count + 5)
        counts_by_key = {row["_id"]: row["count"] for row in rows if row.get("_id")}
        return [{"day": label, value_key: counts_by_key.get(key, 0)} for label, key, _, _ in days]
    except Exception as exc:
        logger.warning(f"chart aggregation fallback for {collection.name}.{field}: {exc}")
        rows = await collection.find({}, {"_id": 0, field: 1}).to_list(50000)
        return _bucket_chart(rows, field, value_key, days_count)


def _build_charts(users: list):
    """Build 14-day activity/registration charts from real user timestamps."""
    registrations_chart = _bucket_chart(users, "created_at", "count")
    activity_rows = [
        {"last_active": u.get("last_seen") or u.get("last_active")}
        for u in users
    ]
    activity_chart = _bucket_chart(activity_rows, "last_active", "active")
    return activity_chart, registrations_chart


def _normalize_dashboard_chart(raw_chart, value_key: str):
    if not isinstance(raw_chart, list):
        return None
    normalized = []
    for row in raw_chart[-14:]:
        if not isinstance(row, dict):
            return None
        day = row.get("day")
        if not day:
            return None
        value = row.get(value_key)
        if value is None and value_key != "count":
            value = row.get("count")
        if value is None and value_key != "active":
            value = row.get("active")
        try:
            value = int(value or 0)
        except (TypeError, ValueError):
            value = 0
        normalized.append({"day": str(day), value_key: value})
    if len(normalized) != 14:
        return None
    return normalized



@api.get("/admin/operations")
async def admin_operations(request: Request):
    await require_admin(request, db)

    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(hours=24)
    current_releases = await _current_public_releases()
    android_release = current_releases.get("android", {})
    website_url = _env_public_url("PUBLIC_WEBSITE_URL", "https://ghostel.app")
    mobile_api_url = _env_public_url("GHOSTEL_MOBILE_API_URL", "https://api.ghostel.app/api/")
    panel_api_url = _env_public_url("PANEL_API_URL", "https://panel-api.ghostel.app/api/")
    apk_url = (android_release.get("download_url") or os.environ.get("GHOSTEL_APK_URL") or "https://api.ghostel.app/app-release.apk?v=1.4.54").strip()
    release_api_url = _env_public_url(
        "GHOSTEL_RELEASE_API_URL",
        android_release.get("release_url") or "https://api.github.com/repos/Ghostelapp/app-Gostel/releases/latest",
    )

    services = [
        {"key": "website", "name": "ghostel.app website", "url": website_url, "method": "HEAD"},
        {"key": "mobile_api", "name": "Mobile app API", "url": mobile_api_url, "method": "GET"},
        {"key": "panel_api", "name": "Website panel API", "url": panel_api_url, "method": "GET"},
        {"key": "android_apk", "name": "Android APK download", "url": apk_url, "method": "HEAD"},
        {"key": "github_release", "name": "GitHub latest release API", "url": release_api_url, "method": "GET"},
    ]

    async with httpx.AsyncClient(timeout=7.0, follow_redirects=True) as http_client:
        service_checks, asset_manifest = await asyncio.gather(
            asyncio.gather(*[_admin_operations_check(http_client, service) for service in services]),
            _admin_asset_manifest(http_client, website_url),
        )

    apk_check = next((row for row in service_checks if row["key"] == "android_apk"), {})
    apk_headers = apk_check.get("headers") or {}
    apk_query_version = ""
    for part in urlparse(apk_url).query.split("&"):
        key, _, value = part.partition("=")
        if key == "v":
            apk_query_version = value[:40]
            break

    active_now = len(
        await db.website_sessions.distinct(
            "visitor_id",
            {"last_seen_at": {"$gte": now - timedelta(minutes=5)}},
        )
    )
    counts = {
        "support_open": await db.support_tickets.count_documents({"status": {"$in": ["new", "open", "waiting"]}}),
        "support_urgent": await db.support_tickets.count_documents({"priority": "urgent", "status": {"$nin": ["resolved", "closed"]}}),
        "support_unassigned": await db.support_tickets.count_documents(
            {
                "status": {"$in": ["new", "open", "waiting"]},
                "$or": [{"assigned_to": ""}, {"assigned_to": None}, {"assigned_to": {"$exists": False}}],
            }
        ),
        "bug_pending": await db.support_tickets.count_documents({"category": "bug", "bug_status": "pending"}),
        "bug_accepted": await db.support_tickets.count_documents({"category": "bug", "bug_status": "accepted"}),
        "errors_24h": await db.error_logs.count_documents(
            {
                "$or": [
                    {"created_dt": {"$gte": last_24h}},
                    {"created_dt": {"$exists": False}, "created_at": {"$gte": last_24h.isoformat()}},
                ]
            }
        ),
        "website_active_now": active_now,
    }

    healthy_services = sum(1 for row in service_checks if row.get("ok"))
    return {
        "generated_at": now.isoformat(),
        "summary": {
            "healthy_services": healthy_services,
            "total_services": len(service_checks),
            "overall_status": "operational"
            if healthy_services == len(service_checks)
            else "degraded"
            if healthy_services
            else "outage",
        },
        "services": service_checks,
        "builds": {
            "android": {
                "apk_url": _clean_error_text(apk_url, max_len=300),
                "release_center_version": android_release.get("version", ""),
                "release_center_build": android_release.get("build_number", ""),
                "query_version": apk_query_version,
                "header_version": apk_headers.get("x-ghostel-android-version", ""),
                "content_length": apk_headers.get("content-length", ""),
                "content_type": apk_headers.get("content-type", ""),
                "content_disposition": apk_headers.get("content-disposition", ""),
                "cache_control": apk_headers.get("cache-control", ""),
                "last_modified": apk_headers.get("last-modified", ""),
            },
            "website": asset_manifest,
        },
        "counts": counts,
        "configuration": {
            "ghostel_public_api_configured": ghostel_client.has_public_api,
            "ghostel_admin_bridge_configured": ghostel_client.is_configured,
            "secure_cookies_enabled": _cookie_secure(),
            "frontend_url": _clean_error_text(os.environ.get("FRONTEND_URL", ""), max_len=300),
            "public_website_url": _clean_error_text(website_url, max_len=300),
            "mobile_api_url": _clean_error_text(mobile_api_url, max_len=300),
            "panel_api_url": _clean_error_text(panel_api_url, max_len=300),
            "release_api_url": _clean_error_text(release_api_url, max_len=300),
            "error_log_redaction_enabled": True,
        },
    }


@api.get("/admin/dashboard")
async def admin_dashboard(request: Request):
    await require_admin(request, db)
    website_analytics = await _website_analytics()
    stats = None
    users = []
    source = "local"
    source_error = ""
    if ghostel_client.is_configured:
        try:
            stats = await ghostel_client.stats()
            users = await ghostel_client.users()
            source = "ghostel"
        except Exception as e:
            source_error = str(e)[:240]
            logger.warning(f"ghostel.app API unreachable, falling back to local: {e}")

    if source == "ghostel":
        public_users = [_ghostel_user_to_public(u) for u in users]
        fallback_activity_chart, fallback_registrations_chart = _build_charts(users)
        activity_chart = (
            _normalize_dashboard_chart(stats.get("activity_chart"), "active")
            or fallback_activity_chart
        )
        registrations_chart = (
            _normalize_dashboard_chart(stats.get("registrations_chart"), "count")
            or fallback_registrations_chart
        )
        messages_chart = (
            _normalize_dashboard_chart(stats.get("messages_chart"), "count")
            or _empty_chart("count")
        )
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
            "source_error": source_error,
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
    activity = await _collection_date_chart(db.users, "last_active", "active")
    registrations = await _collection_date_chart(db.users, "created_at", "count")
    messages_chart = await _collection_date_chart(db.messages, "created_at", "count")
    recent_users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).limit(5).to_list(5)
    return {
        "source": source,
        "source_error": source_error,
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


# ----- Admin: Release Center -----
@api.get("/admin/releases")
async def list_releases(request: Request):
    await require_admin(request, db)
    items = await db.release_records.find({}, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return {
        "items": items,
        "current": await _current_public_releases(),
    }


@api.post("/admin/releases")
async def create_release(payload: ReleaseCreateIn, request: Request):
    admin = await require_admin(request, db)
    now_iso = datetime.now(timezone.utc).isoformat()
    data = payload.model_dump()
    data["platform"] = data["platform"].lower()
    data["version"] = _clean_error_text(data["version"].strip(), max_len=40)
    data["build_number"] = _clean_error_text((data.get("build_number") or "").strip(), max_len=40)
    data["title"] = _clean_error_text((data.get("title") or "").strip(), max_len=140) or f"{data['platform']} {data['version']}"
    data["notes"] = _clean_error_text((data.get("notes") or "").strip(), max_len=4000)
    data["commit_sha"] = _clean_error_text((data.get("commit_sha") or "").strip(), max_len=80)
    data["download_url"] = _safe_admin_url(data.get("download_url"))
    data["release_url"] = _safe_admin_url(data.get("release_url"))
    data["published_at"] = _clean_error_text(data.get("published_at") or "", max_len=80)
    if data["current"]:
        data["status"] = "published"
        data["public"] = True
        data["published_at"] = data["published_at"] or now_iso
        await db.release_records.update_many(
            {"platform": data["platform"]},
            {"$set": {"current": False, "updated_at": now_iso}},
        )

    doc = {
        "id": str(uuid.uuid4()),
        **data,
        "created_by": admin.get("email") or admin.get("id") or "admin",
        "created_at": now_iso,
        "updated_at": now_iso,
        "source": "release_center",
    }
    await db.release_records.insert_one(doc)
    return _release_public_doc(doc)


@api.patch("/admin/releases/{release_id}")
async def update_release(release_id: str, payload: ReleaseUpdateIn, request: Request):
    admin = await require_admin(request, db)
    current = await db.release_records.find_one({"id": release_id})
    if not current:
        raise HTTPException(status_code=404, detail="Release not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    update = payload.model_dump(exclude_unset=True)
    if not update:
        return _release_public_doc(current)

    for key in ("version", "build_number", "title", "notes", "commit_sha", "published_at"):
        if key in update and update[key] is not None:
            max_len = 4000 if key == "notes" else 140 if key == "title" else 80
            if key == "version":
                max_len = 40
            update[key] = _clean_error_text(str(update[key]).strip(), max_len=max_len)
    for key in ("download_url", "release_url"):
        if key in update and update[key] is not None:
            update[key] = _safe_admin_url(update[key])
    if update.get("platform"):
        update["platform"] = update["platform"].lower()

    platform = update.get("platform") or current.get("platform")
    if update.get("current") is True:
        update["status"] = "published"
        update["public"] = True
        update["published_at"] = update.get("published_at") or current.get("published_at") or now_iso
        await db.release_records.update_many(
            {"platform": platform, "id": {"$ne": release_id}},
            {"$set": {"current": False, "updated_at": now_iso}},
        )

    update["updated_by"] = admin.get("email") or admin.get("id") or "admin"
    update["updated_at"] = now_iso
    doc = await db.release_records.find_one_and_update(
        {"id": release_id},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    return doc


@api.delete("/admin/releases/{release_id}")
async def delete_release(release_id: str, request: Request):
    await require_admin(request, db)
    result = await db.release_records.delete_one({"id": release_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Release not found")
    return {"ok": True}


# ----- Admin: Public status manager -----
@api.get("/admin/status-incidents")
async def list_status_incidents(request: Request):
    await require_admin(request, db)
    items = await db.status_incidents.find({}, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return {"items": items}


@api.post("/admin/status-incidents")
async def create_status_incident(payload: StatusIncidentCreateIn, request: Request):
    admin = await require_admin(request, db)
    now_iso = datetime.now(timezone.utc).isoformat()
    resolved_at = now_iso if payload.status == "resolved" else None
    doc = {
        "id": str(uuid.uuid4()),
        "service": payload.service,
        "title": _clean_error_text(payload.title.strip(), max_len=140),
        "message": _clean_error_text((payload.message or "").strip(), max_len=2000),
        "status": payload.status,
        "impact": payload.impact,
        "public": payload.public,
        "created_by": admin.get("email") or admin.get("id") or "admin",
        "created_at": now_iso,
        "updated_at": now_iso,
        "resolved_at": resolved_at,
    }
    await db.status_incidents.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/admin/status-incidents/{incident_id}")
async def update_status_incident(incident_id: str, payload: StatusIncidentUpdateIn, request: Request):
    admin = await require_admin(request, db)
    current = await db.status_incidents.find_one({"id": incident_id})
    if not current:
        raise HTTPException(status_code=404, detail="Incident not found")

    update = payload.model_dump(exclude_unset=True)
    if not update:
        current.pop("_id", None)
        return current
    if "title" in update and update["title"] is not None:
        update["title"] = _clean_error_text(update["title"].strip(), max_len=140)
    if "message" in update and update["message"] is not None:
        update["message"] = _clean_error_text(update["message"].strip(), max_len=2000)

    now_iso = datetime.now(timezone.utc).isoformat()
    if update.get("status") == "resolved":
        update["resolved_at"] = current.get("resolved_at") or now_iso
    elif update.get("status") in {"investigating", "identified", "monitoring"}:
        update["resolved_at"] = None
    update["updated_by"] = admin.get("email") or admin.get("id") or "admin"
    update["updated_at"] = now_iso

    doc = await db.status_incidents.find_one_and_update(
        {"id": incident_id},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    return doc


@api.delete("/admin/status-incidents/{incident_id}")
async def delete_status_incident(incident_id: str, request: Request):
    await require_admin(request, db)
    result = await db.status_incidents.delete_one({"id": incident_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"ok": True}


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
                {"store_email": {"$regex": pattern, "$options": "i"}},
                {"subject": {"$regex": pattern, "$options": "i"}},
                {"message": {"$regex": pattern, "$options": "i"}},
                {"device_model": {"$regex": pattern, "$options": "i"}},
            ]

    tickets = await db.support_tickets.find(query, {"_id": 0, "ip_hash": 0}).sort("created_at", -1).to_list(500)
    summary = {
        "total": await db.support_tickets.count_documents({}),
        "new": await db.support_tickets.count_documents({"status": "new"}),
        "open": await db.support_tickets.count_documents({"status": {"$in": ["new", "open", "waiting"]}}),
        "resolved": await db.support_tickets.count_documents({"status": {"$in": ["resolved", "closed"]}}),
        "urgent": await db.support_tickets.count_documents({"priority": "urgent"}),
        "high": await db.support_tickets.count_documents({"priority": "high"}),
        "tester": await db.support_tickets.count_documents({"category": "tester"}),
        "bug": await db.support_tickets.count_documents({"category": "bug"}),
        "bug_pending": await db.support_tickets.count_documents({"category": "bug", "bug_status": "pending"}),
        "bug_accepted": await db.support_tickets.count_documents({"category": "bug", "bug_status": "accepted"}),
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
    if "public_reporter_name" in update:
        update["public_reporter_name"] = _safe_public_reporter_name(update["public_reporter_name"], current.get("name"))
    if ("bug_status" in update or "bug_points" in update) and current.get("category") != "bug":
        raise HTTPException(status_code=400, detail="Bug ranking can be changed only for bug tickets.")

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


# ----- Admin: Error logs -----
@api.get("/admin/error-logs")
async def list_error_logs(
    request: Request,
    source: Optional[Literal["app", "website", "backend", "all"]] = Query(default="all"),
    level: Optional[Literal["error", "warning", "info", "all"]] = Query(default="all"),
    platform: Optional[Literal["ios", "android", "web", "desktop", "server", "unknown", "all"]] = Query(default="all"),
    q: Optional[str] = Query(default=None, max_length=160),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0, le=10000),
):
    await require_admin(request, db)
    query: dict[str, Any] = {}
    if source and source != "all":
        query["source"] = source
    if level and level != "all":
        query["level"] = level
    if platform and platform != "all":
        query["platform"] = platform
    if q:
        needle = q.strip()
        if needle:
            pattern = re.escape(needle)
            query["$or"] = [
                {"message": {"$regex": pattern, "$options": "i"}},
                {"route": {"$regex": pattern, "$options": "i"}},
                {"screen": {"$regex": pattern, "$options": "i"}},
                {"app_version": {"$regex": pattern, "$options": "i"}},
                {"fingerprint": {"$regex": pattern, "$options": "i"}},
            ]

    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(hours=24)
    items = await db.error_logs.find(query, {"_id": 0, "ip_hash": 0}).sort("created_dt", -1).skip(offset).limit(limit).to_list(limit)
    total = await db.error_logs.count_documents(query)

    async def count(extra: dict[str, Any]) -> int:
        return await db.error_logs.count_documents({**query, **extra})

    fingerprint_rows = await db.error_logs.aggregate(
        [
            {"$match": query},
            {"$group": {"_id": "$fingerprint", "count": {"$sum": 1}, "message": {"$first": "$message"}, "last_seen": {"$max": "$created_dt"}}},
            {"$sort": {"count": -1, "last_seen": -1}},
            {"$limit": 10},
            {"$project": {"_id": 0, "fingerprint": "$_id", "count": 1, "message": 1, "last_seen": 1}},
        ]
    ).to_list(10)
    for row in fingerprint_rows:
        if isinstance(row.get("last_seen"), datetime):
            row["last_seen"] = row["last_seen"].isoformat()

    summary = {
        "total": total,
        "errors": await count({"level": "error"}),
        "warnings": await count({"level": "warning"}),
        "app": await count({"source": "app"}),
        "website": await count({"source": "website"}),
        "backend": await count({"source": "backend"}),
        "last_24h": await count({"created_dt": {"$gte": last_24h}}),
        "top_fingerprints": fingerprint_rows,
    }
    return {"items": [_public_error_log_doc(item) for item in items], "summary": summary, "total": total}


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
        writer.writerow(["public_id", "name", "public_reporter_name", "email", "store_email", "category", "bug_status", "bug_points", "tester_platform", "device_model", "app_platform", "app_version", "subject", "status", "priority", "assigned_to", "source", "created_at", "updated_at"])
        tickets = await db.support_tickets.find({}, {"_id": 0, "ip_hash": 0, "message": 0, "history": 0}).sort("created_at", -1).to_list(5000)
        for t in tickets:
            writer.writerow([
                t.get("public_id"),
                t.get("name"),
                t.get("public_reporter_name"),
                t.get("email"),
                t.get("store_email"),
                t.get("category"),
                t.get("bug_status"),
                t.get("bug_points"),
                t.get("tester_platform"),
                t.get("device_model"),
                t.get("app_platform"),
                t.get("app_version"),
                t.get("subject"),
                t.get("status"),
                t.get("priority"),
                t.get("assigned_to"),
                t.get("source"),
                t.get("created_at"),
                t.get("updated_at"),
            ])
    elif kind == "error-logs":
        writer.writerow(["id", "source", "platform", "level", "app_version", "build_number", "route", "screen", "fingerprint", "message", "created_at"])
        logs = await db.error_logs.find({}, {"_id": 0, "ip_hash": 0, "stack": 0, "context": 0, "user_agent": 0}).sort("created_dt", -1).to_list(5000)
        for item in logs:
            writer.writerow([
                item.get("id"),
                item.get("source"),
                item.get("platform"),
                item.get("level"),
                item.get("app_version"),
                item.get("build_number"),
                item.get("route"),
                item.get("screen"),
                item.get("fingerprint"),
                item.get("message"),
                item.get("created_at"),
            ])
    elif kind == "releases":
        writer.writerow(["id", "platform", "version", "build_number", "status", "current", "public", "download_url", "release_url", "commit_sha", "published_at", "updated_at"])
        releases = await db.release_records.find({}, {"_id": 0, "notes": 0}).sort("updated_at", -1).to_list(5000)
        for item in releases:
            writer.writerow([
                item.get("id"),
                item.get("platform"),
                item.get("version"),
                item.get("build_number"),
                item.get("status"),
                item.get("current"),
                item.get("public"),
                item.get("download_url"),
                item.get("release_url"),
                item.get("commit_sha"),
                item.get("published_at"),
                item.get("updated_at"),
            ])
    elif kind == "status-incidents":
        writer.writerow(["id", "service", "title", "status", "impact", "public", "created_at", "updated_at", "resolved_at"])
        incidents = await db.status_incidents.find({}, {"_id": 0, "message": 0}).sort("updated_at", -1).to_list(5000)
        for item in incidents:
            writer.writerow([
                item.get("id"),
                item.get("service"),
                item.get("title"),
                item.get("status"),
                item.get("impact"),
                item.get("public"),
                item.get("created_at"),
                item.get("updated_at"),
                item.get("resolved_at"),
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
    if request.url.path.startswith(("/api/auth", "/api/admin", "/api/contact", "/api/error-logs", "/api/logs/error")):
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
    await db.support_tickets.create_index("bug_status")
    await db.support_tickets.create_index("bug_points")
    await db.support_tickets.create_index("public_reporter_name")
    await db.support_tickets.create_index("store_email")
    await db.support_tickets.create_index("source")
    await db.support_tickets.create_index("created_at")
    await db.error_logs.create_index("id", unique=True)
    await db.error_logs.create_index("created_dt")
    await db.error_logs.create_index("source")
    await db.error_logs.create_index("level")
    await db.error_logs.create_index("platform")
    await db.error_logs.create_index("fingerprint")
    await db.release_records.create_index("id", unique=True)
    await db.release_records.create_index("platform")
    await db.release_records.create_index("current")
    await db.release_records.create_index("status")
    await db.release_records.create_index("updated_at")
    await db.status_incidents.create_index("id", unique=True)
    await db.status_incidents.create_index("updated_at")
    await db.status_incidents.create_index("public")
    await db.status_incidents.create_index("service")
    await db.status_incidents.create_index("status")
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
