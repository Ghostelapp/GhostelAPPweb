# Ghostel — Product Requirements

## Original Problem Statement
Build a complete modern website + admin panel for Ghostel, a real-time communication platform (messages, groups, voice calls, push notifications).

**Style:** Premium SaaS · Dark Mode · Glassmorphism · Neon Blue + Purple · Inspired by Discord/Telegram/Signal/Linear.

## Architecture
- **Backend**: FastAPI + Motor (MongoDB async) + JWT auth (Bearer token).
- **Frontend**: React 19 + Tailwind + Shadcn UI + Framer Motion + Recharts + React Router.
- **Auth**: Bearer JWT in `localStorage` (httpOnly cookies also set for fallback).

## User Personas
- **Visitor** — lands on marketing page, reads features, signs up.
- **Admin** — logs in, manages users/groups/moderation/notifications.
- **Moderator** (future) — limited admin powers, e.g. reports only.

## Core Requirements (static)
1. Landing page with Hero + phone mockup, Features, Why us, How it works, Stats, Testimonials, Pricing, FAQ, Footer.
2. JWT login & registration.
3. Admin panel: Dashboard (stats + Recharts), Users CRUD, Groups CRUD, Moderation queue, Push notification center, Roles, Settings, Reports (CSV export).
4. Bilingual UI (PL/EN) with language toggle.
5. Dark mode permanently, glassmorphism, neon accents.

## What's been implemented (2026-05-29)
- ✅ Full landing page (10 sections) with Framer Motion animations.
- ✅ Phone mockup with floating notifications, animated chat list.
- ✅ Animated stat counters.
- ✅ FAQ accordion (Shadcn), Pricing tiers (Free / Premium 19zł).
- ✅ Auth: register / login / logout / `/me` with Bearer JWT.
- ✅ Admin Dashboard with 5 stat cards + 3 Recharts visualizations.
- ✅ Users management (search, role/status badges, dropdown actions, delete, view detail dialog).
- ✅ Groups management (search, create dialog, block/unblock, delete).
- ✅ Moderation tabs (all/messages/users/groups) with accept/reject/block actions.
- ✅ Notification Center (compose form + send + history).
- ✅ Roles page with counts + per-user role assignment buttons.
- ✅ Settings page (app name, logo, colors, terms, privacy, maintenance toggle, max file size).
- ✅ Reports page with CSV export for users/groups/reports/activity.
- ✅ Bilingual PL/EN with toggle.
- ✅ Backend tests: 33/33 passing.

## Prioritized Backlog

### P1 — Next iteration
- Real-time chat MVP (WebSockets / Socket.IO).
- Mobile responsive admin sidebar (drawer on mobile).
- XLSX & PDF export.
- Pagination on users/groups tables.
- Brute-force lockout on login (5 fails → 15 min).
- Password reset flow.

### P2
- Real voice/video call integration (WebRTC).
- Push notification delivery via FCM/APNs.
- 2FA for admins.
- Audit log of admin actions.
- Stripe Premium subscription flow (revenue conversion).

## Test Credentials
See `/app/memory/test_credentials.md`
