export const ANALYTICS_CONSENT_KEY = "ghostel-analytics-consent";
export const ANALYTICS_CONSENT_EVENT = "ghostel-analytics-consent-change";

export function getAnalyticsConsent() {
  try {
    return localStorage.getItem(ANALYTICS_CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(value) {
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    // Privacy modes can block storage; notify the current tab anyway.
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: value }));
}
