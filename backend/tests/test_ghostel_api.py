"""Backend API tests for Ghostel - auth + admin flows."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@ghostel.app")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
USER_EMAIL = os.environ.get("TEST_USER_EMAIL")
USER_PASSWORD = os.environ.get("TEST_USER_PASSWORD")


# ---- Fixtures ----
@pytest.fixture(scope="session")
def admin_token():
    if not ADMIN_PASSWORD:
        pytest.skip("ADMIN_PASSWORD env var is required for admin API tests")
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    assert data["role"] == "admin"
    return data["access_token"]


@pytest.fixture(scope="session")
def admin_id(admin_token):
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    return r.json()["id"]


@pytest.fixture(scope="session")
def user_token():
    if not USER_EMAIL or not USER_PASSWORD:
        pytest.skip("TEST_USER_EMAIL and TEST_USER_PASSWORD env vars are required for user login tests")
    r = requests.post(f"{API}/auth/login", json={"email": USER_EMAIL, "password": USER_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"User login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


def admin_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---- Auth ----
class TestAuth:
    def test_health(self):
        r = requests.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()

    def test_login_admin_success(self):
        if not ADMIN_PASSWORD:
            pytest.skip("ADMIN_PASSWORD env var is required for admin API tests")
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert isinstance(d["access_token"], str) and len(d["access_token"]) > 10

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WrongPass!"})
        assert r.status_code == 401

    def test_login_unknown_email(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nobody@ghostel.app", "password": "Anything1!"})
        assert r.status_code == 401

    def test_register_creates_user(self):
        email = f"TEST_user_{uuid.uuid4().hex[:8]}@ghostel.app"
        r = requests.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "Password123!"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email"] == email.lower()
        assert d["role"] == "user"
        assert "access_token" in d
        # verify token works
        me = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {d['access_token']}"})
        assert me.status_code == 200
        assert me.json()["email"] == email.lower()

    def test_register_duplicate_email_rejected(self):
        r = requests.post(f"{API}/auth/register", json={"name": "Admin Dup", "email": ADMIN_EMAIL, "password": "Password123!"})
        assert r.status_code == 400

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.real.jwt"})
        assert r.status_code == 401


# ---- Admin: Dashboard ----
class TestDashboard:
    def test_dashboard_admin(self, admin_token):
        r = requests.get(f"{API}/admin/dashboard", headers=admin_headers(admin_token))
        assert r.status_code == 200
        d = r.json()
        for key in ("stats", "activity_chart", "registrations_chart", "messages_chart", "recent_activity"):
            assert key in d, f"missing {key}"
        for sk in ("total_users", "active_users", "total_messages", "total_groups", "pending_reports"):
            assert sk in d["stats"]
        assert isinstance(d["activity_chart"], list) and len(d["activity_chart"]) == 14
        assert isinstance(d["registrations_chart"], list) and len(d["registrations_chart"]) == 14
        assert isinstance(d["messages_chart"], list) and len(d["messages_chart"]) == 14

    def test_dashboard_requires_auth(self):
        r = requests.get(f"{API}/admin/dashboard")
        assert r.status_code == 401

    def test_dashboard_forbidden_for_user(self, user_token):
        r = requests.get(f"{API}/admin/dashboard", headers=admin_headers(user_token))
        assert r.status_code == 403


# ---- Admin: Users ----
class TestAdminUsers:
    def test_list_users(self, admin_token):
        r = requests.get(f"{API}/admin/users", headers=admin_headers(admin_token))
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list)
        assert any(u["email"] == ADMIN_EMAIL for u in users)

    def test_search_users(self, admin_token):
        r = requests.get(f"{API}/admin/users?q=alice", headers=admin_headers(admin_token))
        assert r.status_code == 200
        assert any("alice" in u["email"].lower() or "alice" in u["name"].lower() for u in r.json())

    def test_list_users_forbidden(self, user_token):
        r = requests.get(f"{API}/admin/users", headers=admin_headers(user_token))
        assert r.status_code == 403

    def test_update_and_delete_user_flow(self, admin_token):
        # Create a throwaway user via register
        email = f"TEST_upd_{uuid.uuid4().hex[:8]}@ghostel.app"
        reg = requests.post(f"{API}/auth/register", json={"name": "Upd User", "email": email, "password": "Password123!"})
        assert reg.status_code == 200
        uid = reg.json()["id"]

        # PATCH update role + status
        r = requests.patch(f"{API}/admin/users/{uid}", json={"role": "moderator", "status": "active"}, headers=admin_headers(admin_token))
        assert r.status_code == 200, r.text
        assert r.json()["role"] == "moderator"

        # Verify via GET
        g = requests.get(f"{API}/admin/users/{uid}", headers=admin_headers(admin_token))
        assert g.status_code == 200
        assert g.json()["role"] == "moderator"

        # DELETE
        d = requests.delete(f"{API}/admin/users/{uid}", headers=admin_headers(admin_token))
        assert d.status_code == 200

        # Confirm gone
        g2 = requests.get(f"{API}/admin/users/{uid}", headers=admin_headers(admin_token))
        assert g2.status_code == 404

    def test_cannot_delete_self(self, admin_token, admin_id):
        r = requests.delete(f"{API}/admin/users/{admin_id}", headers=admin_headers(admin_token))
        assert r.status_code == 400


# ---- Admin: Groups ----
class TestAdminGroups:
    def test_groups_crud(self, admin_token):
        # list
        r = requests.get(f"{API}/admin/groups", headers=admin_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

        # create
        name = f"TEST_grp_{uuid.uuid4().hex[:6]}"
        c = requests.post(f"{API}/admin/groups", json={"name": name, "description": "qa", "visibility": "public"}, headers=admin_headers(admin_token))
        assert c.status_code == 200, c.text
        gid = c.json()["id"]
        assert c.json()["name"] == name

        # patch
        p = requests.patch(f"{API}/admin/groups/{gid}", json={"description": "updated"}, headers=admin_headers(admin_token))
        assert p.status_code == 200
        assert p.json()["description"] == "updated"

        # delete
        d = requests.delete(f"{API}/admin/groups/{gid}", headers=admin_headers(admin_token))
        assert d.status_code == 200

        # patch missing -> 404
        p2 = requests.patch(f"{API}/admin/groups/{gid}", json={"description": "x"}, headers=admin_headers(admin_token))
        assert p2.status_code == 404

    def test_groups_forbidden(self, user_token):
        r = requests.get(f"{API}/admin/groups", headers=admin_headers(user_token))
        assert r.status_code == 403


# ---- Admin: Reports ----
class TestReports:
    def test_list_reports(self, admin_token):
        r = requests.get(f"{API}/admin/reports", headers=admin_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_report_action(self, admin_token):
        reports = requests.get(f"{API}/admin/reports", headers=admin_headers(admin_token)).json()
        if not reports:
            pytest.skip("No reports seeded")
        rid = reports[0]["id"]
        r = requests.post(f"{API}/admin/reports/{rid}/action", json={"action": "accept"}, headers=admin_headers(admin_token))
        assert r.status_code == 200
        assert r.json()["status"] == "accepted"

    def test_report_invalid_action(self, admin_token):
        reports = requests.get(f"{API}/admin/reports", headers=admin_headers(admin_token)).json()
        if not reports:
            pytest.skip("No reports seeded")
        rid = reports[0]["id"]
        r = requests.post(f"{API}/admin/reports/{rid}/action", json={"action": "invalid"}, headers=admin_headers(admin_token))
        assert r.status_code == 400


# ---- Admin: Notifications ----
class TestNotifications:
    def test_list_notifications(self, admin_token):
        r = requests.get(f"{API}/admin/notifications", headers=admin_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_send_notification_all(self, admin_token):
        r = requests.post(
            f"{API}/admin/notifications",
            json={"title": "TEST Notif", "body": "hello", "target_type": "all"},
            headers=admin_headers(admin_token),
        )
        assert r.status_code == 200
        d = r.json()
        assert d["title"] == "TEST Notif"
        assert d["status"] == "sent"
        assert d["recipients"] >= 1


# ---- Admin: Settings ----
class TestSettings:
    def test_get_settings(self, admin_token):
        r = requests.get(f"{API}/admin/settings", headers=admin_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_patch_settings_persists(self, admin_token):
        new_name = f"Ghostel-{uuid.uuid4().hex[:4]}"
        r = requests.patch(f"{API}/admin/settings", json={"app_name": new_name}, headers=admin_headers(admin_token))
        assert r.status_code == 200
        assert r.json().get("app_name") == new_name
        # verify
        g = requests.get(f"{API}/admin/settings", headers=admin_headers(admin_token))
        assert g.json().get("app_name") == new_name


# ---- Admin: CSV export ----
class TestCSVExport:
    @pytest.mark.parametrize("kind", ["users", "groups", "reports", "activity"])
    def test_export_with_bearer(self, admin_token, kind):
        r = requests.get(f"{API}/admin/export/{kind}", headers=admin_headers(admin_token))
        assert r.status_code == 200, r.text
        assert r.headers.get("content-type", "").startswith("text/csv")
        # first line should be header row with commas
        first = r.text.splitlines()[0]
        assert "," in first

    def test_export_with_query_token(self, admin_token):
        r = requests.get(f"{API}/admin/export/users", params={"token": admin_token})
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("text/csv")

    def test_export_unknown_kind(self, admin_token):
        r = requests.get(f"{API}/admin/export/unknown", headers=admin_headers(admin_token))
        assert r.status_code == 400

    def test_export_unauthorized(self):
        r = requests.get(f"{API}/admin/export/users")
        assert r.status_code == 401

    def test_export_forbidden_for_user(self, user_token):
        r = requests.get(f"{API}/admin/export/users", headers=admin_headers(user_token))
        assert r.status_code == 403
