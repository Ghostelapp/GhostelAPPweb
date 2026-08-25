import { useEffect, useState } from "react";
import {
  GHOSTEL_APK_ASSET_NAME,
  GHOSTEL_APK_URL,
  GHOSTEL_ANDROID_VERSION,
  GHOSTEL_DESKTOP_ASSET_NAME,
  GHOSTEL_DESKTOP_URL,
  GHOSTEL_PANEL_API_URL,
  GHOSTEL_RELEASE_API_URL,
} from "@/lib/constants";

const CACHE_KEY = `ghostel-latest-release-${GHOSTEL_ANDROID_VERSION}`;
const CACHE_MAX_AGE_MS = 15 * 60 * 1000;

const fallbackRelease = {
  version: GHOSTEL_ANDROID_VERSION,
  apkUrl: GHOSTEL_APK_URL,
  desktopUrl: GHOSTEL_DESKTOP_URL,
};

function normalizeRelease(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const findAsset = (name) =>
    assets.find((asset) => asset?.name === name)?.browser_download_url;
  const releaseVersion = String(release?.tag_name || "").replace(/^v/i, "");
  const matchesCurrentAndroid = releaseVersion === GHOSTEL_ANDROID_VERSION;

  return {
    version: GHOSTEL_ANDROID_VERSION,
    apkUrl:
      (matchesCurrentAndroid && findAsset(GHOSTEL_APK_ASSET_NAME)) ||
      GHOSTEL_APK_URL,
    desktopUrl:
      findAsset(GHOSTEL_DESKTOP_ASSET_NAME) || GHOSTEL_DESKTOP_URL,
  };
}

function normalizeReleaseCenter(data) {
  const releases = data?.releases || {};
  const android = releases.android || {};
  const desktop = releases.desktop || {};
  return {
    version: android.version || GHOSTEL_ANDROID_VERSION,
    apkUrl: android.download_url || GHOSTEL_APK_URL,
    desktopUrl: desktop.download_url || GHOSTEL_DESKTOP_URL,
  };
}

function readCachedRelease() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (
      cached?.savedAt &&
      Date.now() - cached.savedAt < CACHE_MAX_AGE_MS &&
      cached.release
    ) {
      return cached.release;
    }
  } catch {
    // A missing or invalid cache should never block download buttons.
  }
  return null;
}

export function useLatestRelease() {
  const [release, setRelease] = useState(() => readCachedRelease() || fallbackRelease);

  useEffect(() => {
    const controller = new AbortController();

    const saveRelease = (latestRelease) => {
      setRelease(latestRelease);
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ savedAt: Date.now(), release: latestRelease }),
        );
      } catch {
        // Downloads still work when browser storage is unavailable.
      }
    };

    const loadGithubFallback = () =>
      fetch(GHOSTEL_RELEASE_API_URL, {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error(`GitHub release API returned ${response.status}`);
          return response.json();
        })
        .then((data) => saveRelease(normalizeRelease(data)));

    fetch(`${GHOSTEL_PANEL_API_URL}/api/releases/current`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Release Center API returned ${response.status}`);
        return response.json();
      })
      .then((data) => saveRelease(normalizeReleaseCenter(data)))
      .catch((error) => {
        if (error.name !== "AbortError") {
          loadGithubFallback().catch(() => setRelease((current) => current || fallbackRelease));
        }
      });

    return () => controller.abort();
  }, []);

  return release;
}
