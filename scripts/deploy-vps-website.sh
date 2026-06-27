#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${BRANCH:-GhostelWebApp}"
PUBLIC_ROOT="${PUBLIC_ROOT:-/var/www/ghostel}"
WEB_API_SERVICE="${WEB_API_SERVICE:-ghostel-web-api}"

echo "Deploying Ghostel website from ${APP_ROOT}"

cd "${APP_ROOT}"
git pull --ff-only origin "${BRANCH}"

cd "${APP_ROOT}/backend"
python3 -m py_compile server.py auth_utils.py ghostel_client.py
sudo -n systemctl restart "${WEB_API_SERVICE}"
sudo -n systemctl is-active "${WEB_API_SERVICE}"

cd "${APP_ROOT}/frontend"
if command -v yarn >/dev/null 2>&1; then
  yarn install --frozen-lockfile
  yarn build
else
  npm install
  npm run build
fi

sudo -n mkdir -p "${PUBLIC_ROOT}"
sudo -n cp -a "${APP_ROOT}/frontend/build/." "${PUBLIC_ROOT}/"
sudo -n nginx -t
sudo -n systemctl reload nginx

echo "Published frontend assets:"
grep -o 'main\.[a-f0-9]*\.js' "${APP_ROOT}/frontend/build/index.html" | head -1
