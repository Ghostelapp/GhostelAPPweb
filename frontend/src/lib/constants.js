// Android APK is currently shipped from EAS build artifacts so the landing
// page can point at the newest tested package immediately after a build.
export const GHOSTEL_APK_URL =
  "https://expo.dev/artifacts/eas/t6RjxEK2nWiuTRh7zbaA4H.apk";

export const GHOSTEL_ANDROID_VERSION = "1.4.13";

// Desktop builds still use the latest GitHub release asset URL.

export const GHOSTEL_WEB_APP_URL =
  process.env.REACT_APP_GHOSTEL_WEB_APP_URL || "https://app.ghostel.app";

export const GHOSTEL_DESKTOP_URL =
  "https://github.com/Ghostelapp/app-Gostel/releases/latest/download/Ghostel-Desktop-Windows-Setup.exe";

export const GHOSTEL_RELEASE_API_URL =
  "https://api.github.com/repos/Ghostelapp/app-Gostel/releases/latest";

export const GHOSTEL_APK_ASSET_NAME = "Ghostel-Android.apk";
export const GHOSTEL_DESKTOP_ASSET_NAME = "Ghostel-Desktop-Windows-Setup.exe";

// Generic "open app" actions lead to the browser client. Android downloads
// continue to use the stable direct APK URL above.
export const GHOSTEL_APP_URL =
  process.env.REACT_APP_GHOSTEL_APP_URL || GHOSTEL_APK_URL;
