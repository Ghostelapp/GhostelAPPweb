# Ghostel Website

Production website and admin panel for `ghostel.app`.

## VPS Deployment

On the VPS the React build is not served directly from the repository. Nginx
serves `ghostel.app` from `/var/www/ghostel`, so every deployment must copy the
fresh `frontend/build` output there after the build completes.

Run this on the VPS:

```bash
cd ~/apps/GhostelAPPweb
bash scripts/deploy-vps-website.sh
```

The script does the full website deploy:

- pulls `origin/GhostelWebApp` with `--ff-only`;
- validates the backend Python files;
- restarts `ghostel-web-api`;
- installs frontend dependencies and runs the production build;
- copies `frontend/build` into `/var/www/ghostel`;
- validates and reloads nginx.

If nginx still shows an older frontend, verify that `/var/www/ghostel/index.html`
references the same `main.<hash>.js` file as `frontend/build/index.html`.
