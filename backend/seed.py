"""Seed sample data for Ghostel admin panel."""
import uuid
import random
from datetime import datetime, timezone, timedelta
from auth_utils import hash_password


SAMPLE_NAMES = [
    ("Alice Carter", "alice.carter@ghostel.app"),
    ("Marek Nowak", "marek.nowak@ghostel.app"),
    ("Sophie Müller", "sophie.muller@ghostel.app"),
    ("Tom Yamada", "tom.yamada@ghostel.app"),
    ("Emma Schmidt", "emma.schmidt@ghostel.app"),
    ("Kasia Wójcik", "kasia.wojcik@ghostel.app"),
    ("Lukas Berg", "lukas.berg@ghostel.app"),
    ("Nina Rossi", "nina.rossi@ghostel.app"),
    ("Jakub Lewandowski", "jakub.l@ghostel.app"),
    ("Olivia Brown", "olivia.brown@ghostel.app"),
    ("Hugo Martin", "hugo.martin@ghostel.app"),
    ("Zofia Kowalska", "zofia.k@ghostel.app"),
]

AVATARS = [
    "https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?w=200",
    "https://images.unsplash.com/photo-1764545973653-94c40d993495?w=200",
    "https://images.unsplash.com/photo-1765776830139-72b2184dae5a?w=200",
    "https://images.unsplash.com/photo-1758600587730-a11917c13b85?w=200",
]

GROUP_NAMES = [
    "Design Team", "Polish Devs", "Crypto Talk", "Music Lovers",
    "Gaming Lounge", "Photography", "Startup Founders", "Travel Hub",
    "Book Club", "Tech News",
]


async def seed_sample_data(db):
    """Idempotent seed."""
    # Users
    if await db.users.count_documents({"role": {"$ne": "admin"}}) < 10:
        users = []
        now = datetime.now(timezone.utc)
        for i, (name, email) in enumerate(SAMPLE_NAMES):
            existing = await db.users.find_one({"email": email})
            if existing:
                continue
            role = "moderator" if i in (1, 4) else "user"
            status = "blocked" if i == 7 else "active"
            users.append({
                "id": str(uuid.uuid4()),
                "name": name,
                "email": email,
                "password_hash": hash_password("Password123!"),
                "role": role,
                "status": status,
                "avatar": random.choice(AVATARS),
                "created_at": (now - timedelta(days=random.randint(1, 120))).isoformat(),
                "last_active": (now - timedelta(hours=random.randint(0, 72))).isoformat(),
            })
        if users:
            await db.users.insert_many(users)

    # Groups
    if await db.groups.count_documents({}) < 5:
        users_list = await db.users.find({"role": {"$ne": "admin"}}).to_list(50)
        now = datetime.now(timezone.utc)
        groups = []
        for name in GROUP_NAMES:
            if await db.groups.find_one({"name": name}):
                continue
            members = random.sample(users_list, min(len(users_list), random.randint(3, 8)))
            groups.append({
                "id": str(uuid.uuid4()),
                "name": name,
                "description": f"Społeczność: {name}",
                "visibility": random.choice(["public", "private"]),
                "members_count": len(members),
                "member_ids": [m["id"] for m in members],
                "owner_id": members[0]["id"] if members else None,
                "status": "active",
                "created_at": (now - timedelta(days=random.randint(1, 90))).isoformat(),
            })
        if groups:
            await db.groups.insert_many(groups)

    # Messages stats
    if await db.messages.count_documents({}) < 50:
        now = datetime.now(timezone.utc)
        messages = []
        for d in range(30):
            day = now - timedelta(days=d)
            count = random.randint(80, 400)
            for _ in range(min(count, 20)):
                messages.append({
                    "id": str(uuid.uuid4()),
                    "content": "Sample message",
                    "created_at": day.isoformat(),
                    "_day_count": count,
                })
        if messages:
            await db.messages.insert_many(messages)

    # Reports
    if await db.reports.count_documents({}) < 3:
        now = datetime.now(timezone.utc)
        users_list = await db.users.find({"role": {"$ne": "admin"}}).to_list(10)
        groups_list = await db.groups.find({}).to_list(5)
        sample_reports = [
            {
                "id": str(uuid.uuid4()),
                "type": "message",
                "target": "Inappropriate language in chat",
                "reporter": users_list[0]["name"] if users_list else "Anonymous",
                "reason": "Spam / Reklama",
                "status": "pending",
                "created_at": (now - timedelta(hours=4)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "type": "user",
                "target": users_list[1]["name"] if len(users_list) > 1 else "User",
                "reporter": users_list[2]["name"] if len(users_list) > 2 else "Anonymous",
                "reason": "Nękanie",
                "status": "pending",
                "created_at": (now - timedelta(hours=12)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "type": "group",
                "target": groups_list[0]["name"] if groups_list else "Group",
                "reporter": users_list[3]["name"] if len(users_list) > 3 else "Anonymous",
                "reason": "Treści nieodpowiednie",
                "status": "pending",
                "created_at": (now - timedelta(days=1)).isoformat(),
            },
        ]
        await db.reports.insert_many(sample_reports)

    # App settings
    existing_settings = await db.settings.find_one({"key": "app_settings"})
    if not existing_settings:
        await db.settings.insert_one({
            "key": "app_settings",
            "app_name": "Ghostel",
            "logo_url": "",
            "primary_color": "#00E5FF",
            "secondary_color": "#B026FF",
            "terms": "Regulamin Ghostel – aktualizuj w panelu administracyjnym.",
            "privacy": "Polityka prywatności Ghostel – aktualizuj w panelu administracyjnym.",
            "maintenance_mode": False,
            "max_file_size_mb": 50,
        })
