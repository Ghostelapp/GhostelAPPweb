import axios from "axios";

const configuredBackendUrl = process.env.REACT_APP_BACKEND_URL;
const isProductionWebsite =
  window.location.hostname === "ghostel.app" ||
  window.location.hostname === "www.ghostel.app";
const BACKEND_URL =
  isProductionWebsite &&
  (!configuredBackendUrl || configuredBackendUrl === "https://ghostel.app")
    ? "https://panel-api.ghostel.app"
    : configuredBackendUrl || "http://localhost:8001";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

const TOKEN_KEY = "ghostel_token";

export function getToken() {
  return null;
}

export function setToken(token) {
  // Remove tokens saved by older builds. Authentication now uses HttpOnly cookies.
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable in strict browser privacy modes.
  }
}

setToken(null);

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      setToken(null);
    }
    return Promise.reject(err);
  }
);

export default api;

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || "Wystąpił błąd. Spróbuj ponownie.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .join(" ");
  return String(detail);
}

export async function downloadExport(kind) {
  const response = await api.get(`/admin/export/${kind}`, { responseType: "blob" });
  const disposition = response.headers["content-disposition"] || "";
  const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] || `ghostel-${kind}.csv`;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
