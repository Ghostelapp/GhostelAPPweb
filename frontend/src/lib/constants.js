// Stable APK address hosted on ghostel.app. Keep the latest tested APK at this
// path on the server so existing download buttons never need to change.
export const GHOSTEL_APK_URL =
  process.env.REACT_APP_GHOSTEL_APK_URL || "/downloads/ghostel-latest.apk";

export const GHOSTEL_WEB_APP_URL =
  process.env.REACT_APP_GHOSTEL_WEB_APP_URL || "https://app.ghostel.app";

// Generic "open app" actions lead to the browser client. Android downloads
// continue to use the stable direct APK URL above.
export const GHOSTEL_APP_URL =
  process.env.REACT_APP_GHOSTEL_APP_URL || GHOSTEL_WEB_APP_URL;
