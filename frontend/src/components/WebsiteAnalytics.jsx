import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API } from "@/lib/api";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent } from "@/lib/privacy";

const VISITOR_KEY = "ghostel-website-visitor";
const SESSION_KEY = "ghostel-website-session";

function getStoredId(storage, key) {
  try {
    let value = storage.getItem(key);
    if (!value) {
      value = crypto.randomUUID();
      storage.setItem(key, value);
    }
    return value;
  } catch {
    return crypto.randomUUID();
  }
}

function getCountry() {
  const parts = (navigator.language || "").split("-");
  const country = parts.at(-1) || "";
  return country.length === 2 ? country.toUpperCase() : "";
}

function sendEvent(event, path) {
  const payload = {
    event,
    visitor_id: getStoredId(localStorage, VISITOR_KEY),
    session_id: getStoredId(sessionStorage, SESSION_KEY),
    path,
    referrer: document.referrer,
    language: navigator.language || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    country: getCountry(),
    screen: `${window.screen.width}x${window.screen.height}`,
  };

  fetch(`${API}/analytics/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export default function WebsiteAnalytics() {
  const location = useLocation();
  const path = location.pathname;
  const [consent, setConsent] = useState(() => getAnalyticsConsent());

  useEffect(() => {
    const update = () => setConsent(getAnalyticsConsent());
    window.addEventListener(ANALYTICS_CONSENT_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    if (consent === "accepted" && !path.startsWith("/admin")) {
      sendEvent("pageview", path);
    }
  }, [path, consent]);

  useEffect(() => {
    const heartbeat = window.setInterval(() => {
      if (
        consent === "accepted" &&
        document.visibilityState === "visible" &&
        !path.startsWith("/admin")
      ) {
        sendEvent("heartbeat", path);
      }
    }, 60_000);
    return () => window.clearInterval(heartbeat);
  }, [path, consent]);

  return null;
}
