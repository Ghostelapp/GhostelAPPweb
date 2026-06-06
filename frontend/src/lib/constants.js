// Stable release asset addresses. GitHub redirects these URLs to assets from
// the latest published release, so the website never points at missing VPS
// files or needs changing for every version.
export const GHOSTEL_APK_URL =
  process.env.REACT_APP_GHOSTEL_APK_URL ||
  "https://github.com/Ghostelapp/app-Gostel/releases/latest/download/Ghostel-Android.apk";

export const GHOSTEL_WEB_APP_URL =
  process.env.REACT_APP_GHOSTEL_WEB_APP_URL || "https://app.ghostel.app";

export const GHOSTEL_DESKTOP_URL =
  process.env.REACT_APP_GHOSTEL_DESKTOP_URL ||
  "https://github.com/Ghostelapp/app-Gostel/releases/latest/download/Ghostel-Desktop-Windows-Setup.exe";

// Generic "open app" actions lead to the browser client. Android downloads
// continue to use the stable direct APK URL above.
export const GHOSTEL_APP_URL =
  process.env.REACT_APP_GHOSTEL_APP_URL || GHOSTEL_WEB_APP_URL;
