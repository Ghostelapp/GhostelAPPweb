// Stable release addresses. Android falls back to the production API so a new
// verified APK can go live before GitHub finishes publishing its release asset.
export const GHOSTEL_APK_URL =
  process.env.REACT_APP_GHOSTEL_APK_URL ||
  "https://api.ghostel.app/app-release.apk?v=1.4.39";

export const GHOSTEL_ANDROID_VERSION = "1.4.39";

export const GHOSTEL_WEB_APP_URL =
  process.env.REACT_APP_GHOSTEL_WEB_APP_URL || "https://app.ghostel.app";

export const GHOSTEL_DESKTOP_URL =
  process.env.REACT_APP_GHOSTEL_DESKTOP_URL ||
  "https://github.com/Ghostelapp/app-Gostel/releases/latest/download/Ghostel-Desktop-Windows-Setup.exe";

export const GHOSTEL_RELEASE_API_URL =
  process.env.REACT_APP_GHOSTEL_RELEASE_API_URL ||
  "https://api.github.com/repos/Ghostelapp/app-Gostel/releases/latest";

export const GHOSTEL_MOBILE_API_URL =
  process.env.REACT_APP_GHOSTEL_MOBILE_API_URL || "https://api.ghostel.app";

export const GHOSTEL_PANEL_API_URL =
  process.env.REACT_APP_BACKEND_URL || "https://panel-api.ghostel.app";

export const GHOSTEL_APK_ASSET_NAME = "Ghostel-Android.apk";
export const GHOSTEL_DESKTOP_ASSET_NAME = "Ghostel-Desktop-Windows-Setup.exe";

// Generic "open app" actions lead to the browser client. Android downloads
// continue to use the stable direct APK URL above.
export const GHOSTEL_APP_URL =
  process.env.REACT_APP_GHOSTEL_APP_URL || GHOSTEL_APK_URL;
