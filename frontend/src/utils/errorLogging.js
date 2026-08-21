import { API } from "@/lib/api";

const SENSITIVE_KEY_RE = /(authorization|cookie|token|password|secret|private|key|jwt|bearer|sdp|candidate|ice|audio|voice|plaintext|ciphertext|nonce|iv|session|credential)/i;
const JWT_RE = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
const BEARER_RE = /Bearer\s+[A-Za-z0-9._~+/=-]{20,}/gi;
const LONG_VALUE_RE = /\b[A-Za-z0-9_:/+=.-]{120,}\b/g;

let installed = false;
const lastSent = new Map();

function cleanText(value, maxLen = 1200) {
  return String(value || "")
    .replace(JWT_RE, "[redacted-jwt]")
    .replace(BEARER_RE, "Bearer [redacted]")
    .replace(LONG_VALUE_RE, "[redacted-long-value]")
    .slice(0, maxLen);
}

function sanitizeContext(value, depth = 0) {
  if (depth > 3) return "[truncated]";
  if (value === null || value === undefined || typeof value === "boolean" || typeof value === "number") {
    return value;
  }
  if (typeof value === "string") return cleanText(value, 800);
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => sanitizeContext(item, depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 30)
        .map(([key, item]) => [
          String(key).slice(0, 80),
          SENSITIVE_KEY_RE.test(key) ? "[redacted]" : sanitizeContext(item, depth + 1),
        ]),
    );
  }
  return cleanText(value, 500);
}

function normalizeError(error) {
  if (error instanceof Error) {
    return {
      message: cleanText(error.message || error.name || "Unhandled error"),
      stack: cleanText(error.stack || "", 6000),
    };
  }
  return {
    message: cleanText(error?.message || error?.reason || error || "Unhandled error"),
    stack: cleanText(error?.stack || "", 6000),
  };
}

function shouldSend(fingerprint) {
  const now = Date.now();
  const previous = lastSent.get(fingerprint) || 0;
  if (now - previous < 10000) return false;
  lastSent.set(fingerprint, now);
  if (lastSent.size > 100) {
    const oldest = [...lastSent.entries()].sort((a, b) => a[1] - b[1]).slice(0, 25);
    oldest.forEach(([key]) => lastSent.delete(key));
  }
  return true;
}

export function reportWebsiteError(error, meta = {}) {
  try {
    const normalized = normalizeError(error);
    if (!normalized.message) return;
    const route = window.location?.pathname || "/";
    const fingerprint = [
      "website",
      meta.level || "error",
      route,
      normalized.message.slice(0, 180),
    ].join("|");
    if (!shouldSend(fingerprint)) return;

    const payload = {
      source: "website",
      platform: "web",
      level: meta.level || "error",
      message: normalized.message,
      stack: normalized.stack,
      route,
      app_version: process.env.REACT_APP_VERSION || "",
      fingerprint,
      context: sanitizeContext({
        ...meta.context,
        userAgent: window.navigator?.userAgent || "",
      }),
    };

    const body = JSON.stringify(payload);
    const url = `${API}/error-logs`;
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }

    fetch(url, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {});
  } catch {
    // Error logging must never create a secondary user-facing failure.
  }
}

export function installWebsiteErrorLogging() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    reportWebsiteError(event.error || event.message, {
      level: "error",
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportWebsiteError(event.reason || "Unhandled promise rejection", {
      level: "error",
      context: { type: "unhandledrejection" },
    });
  });
}
