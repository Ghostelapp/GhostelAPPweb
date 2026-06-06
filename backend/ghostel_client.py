"""Client for upstream Ghostel API."""
import os
import time
import httpx
from typing import Optional


class GhostelClient:
    def __init__(self):
        self.base = os.environ.get("GHOSTEL_API_URL", "").rstrip("/")
        self.email = os.environ.get("GHOSTEL_ADMIN_EMAIL", "")
        self.password = os.environ.get("GHOSTEL_ADMIN_PASSWORD", "")
        self._token: Optional[str] = None
        self._token_expires_at: float = 0
        self._client = httpx.AsyncClient(timeout=15.0)

    @property
    def is_configured(self) -> bool:
        return bool(self.base and self.email and self.password)

    @property
    def has_public_api(self) -> bool:
        return bool(self.base)

    async def close(self):
        await self._client.aclose()

    async def _login(self) -> str:
        r = await self._client.post(
            f"{self.base}/auth/login",
            json={"email": self.email, "password": self.password},
        )
        r.raise_for_status()
        data = r.json()
        self._token = data["access_token"]
        # JWT exp; refresh every ~10 minutes regardless
        self._token_expires_at = time.time() + 10 * 60
        return self._token

    async def _ensure_token(self) -> str:
        if not self._token or time.time() >= self._token_expires_at:
            return await self._login()
        return self._token

    async def _request(self, method: str, path: str, **kw) -> httpx.Response:
        token = await self._ensure_token()
        headers = kw.pop("headers", {})
        headers["Authorization"] = f"Bearer {token}"
        url = f"{self.base}{path}"
        r = await self._client.request(method, url, headers=headers, **kw)
        if r.status_code == 401:
            # token expired, re-login once
            await self._login()
            headers["Authorization"] = f"Bearer {self._token}"
            r = await self._client.request(method, url, headers=headers, **kw)
        return r

    async def public_login(self, email: str, password: str, totp_code: str | None = None) -> dict:
        payload = {"email": email, "password": password}
        if totp_code:
            payload["totp_code"] = totp_code
        r = await self._client.post(f"{self.base}/auth/login", json=payload)
        r.raise_for_status()
        return r.json()

    async def public_register(
        self,
        *,
        email: str,
        password: str,
        name: str,
        title: str = "",
        username: str | None = None,
    ) -> dict:
        payload = {"email": email, "password": password, "name": name, "title": title}
        if username:
            payload["username"] = username
        r = await self._client.post(f"{self.base}/auth/register", json=payload)
        r.raise_for_status()
        return r.json()

    async def stats(self) -> dict:
        r = await self._request("GET", "/admin/stats")
        r.raise_for_status()
        return r.json()

    async def users(self) -> list:
        r = await self._request("GET", "/admin/users")
        r.raise_for_status()
        return r.json()

    async def delete_user(self, user_id: str) -> bool:
        r = await self._request("DELETE", f"/admin/users/{user_id}")
        return r.status_code in (200, 204)

    async def conversations(self) -> list:
        """Fetches admin's own conversations (limited but useful)."""
        r = await self._request("GET", "/conversations")
        if r.status_code != 200:
            return []
        return r.json()


# singleton
ghostel_client = GhostelClient()
