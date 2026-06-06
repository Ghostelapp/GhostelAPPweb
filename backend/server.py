"""Ghostel FastAPI backend - landing page + admin panel."""
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
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
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

app = FastAPI(title="Ghostel API")
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


# ----- helpers -----
def _set_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 12, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 24 * 7, path="/")


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


async def _mirror_app_user(app_user: dict, password: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    email = (app_user.get("email") or "").lower()
    existing = await db.users.find_one({"email": email}) if email else None
    existing_role = existing.get("role") if existing else None
    role = "admin" if existing_role == "admin" else app_user.get("role", "user")
    doc = {
        "id": app_user.get("id") or (existing or {}).get("id") or str(uuid.uuid4()),
        "name": app_user.get("name") or email,
        "email": email,
        "password_hash": hash_password(password),
        "role": role,
        "status": "blocked" if app_user.get("status") == "blocked" else "active",
        "avatar": app_user.get("avatar") or "",
        "created_at": app_user.get("created_at") or (existing or {}).get("created_at") or now,
        "last_active": app_user.get("last_active") or app_user.get("last_seen") or now,
        "app_user_id": app_user.get("id"),
        "username": app_user.get("username", ""),
        "title": app_user.get("title", ""),
    }
    await db.users.update_one({"email": email}, {"$set": doc}, upsert=True)
    return doc


# ----- Health -----
@api.get("/")
async def root():
    return {"message": "Ghostel API ready", "version": "1.0"}


# ----- Auth -----
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
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
        doc = await _mirror_app_user(app_user, payload.password)
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
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        if ghostel_client.has_public_api:
            try:
                app_data = await ghostel_client.public_login(email, payload.password)
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=401, detail=_upstream_detail(e))
            except httpx.RequestError:
                if user:
                    raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")
                raise HTTPException(status_code=503, detail="Nie można połączyć się z API aplikacji. Spróbuj ponownie za chwilę.")
            if app_data.get("requires_2fa"):
                raise HTTPException(status_code=401, detail="To konto ma włączone 2FA. Zaloguj się w aplikacji.")
            app_user = app_data.get("user")
            if not app_user:
                raise HTTPException(status_code=502, detail="API aplikacji nie zwróciło danych użytkownika")
            user = await _mirror_app_user(app_user, payload.password)
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
async def logout(response: Response):
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
    stats = None
    users = []
    source = "local"
    if ghostel_client.is_configured:
        try:
            stats = await ghostel_client.stats()
            users = await ghostel_client.users()
            source = "ghostel"
        except Exception as e:
            logger.warning(f"Ghostel API unreachable, falling back to local: {e}")

    if source == "ghostel":
        public_users = [_ghostel_user_to_public(u) for u in users]
        activity_chart, registrations_chart = _build_charts(users)
        # messages chart synthesized — Ghostel exposes only total, not per-day
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
            logger.warning(f"Ghostel list_users fallback: {e}")
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
    # Upstream Ghostel API does not expose PATCH on users — return current data with note
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
                        detail=f"Edycja użytkownika niedostępna w Ghostel API (read-only). Użytkownik: {pub['email']}",
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
            logger.warning(f"Ghostel delete_user error: {e}")
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
_origins = list({_frontend, "http://localhost:3000", *_extra_origins})
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----- Startup -----
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.groups.create_index("id", unique=True)
    await db.messages.create_index("created_at")
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
    logger.info("Ghostel startup complete")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
