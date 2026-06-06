// Stable APK address hosted on ghostel.app. Keep the latest tested APK at this
// path on the server so existing download buttons never need to change.
export const GHOSTEL_APK_URL =
  process.env.REACT_APP_GHOSTEL_APK_URL || "/downloads/ghostel-latest.apk";

// This can later point to Google Play without changing the direct APK link.
export const GHOSTEL_APP_URL =
  process.env.REACT_APP_GHOSTEL_APP_URL || GHOSTEL_APK_URL;
