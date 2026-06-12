import { createContext, useContext, useEffect, useState } from "react";
import api, { formatApiError, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anonymous
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken(null);
        setUser(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, totpCode = "") => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        totp_code: totpCode || null,
      });
      if (data.requires_2fa) return { ok: false, requires_2fa: true };
      setUser(data);
      return { ok: true, user: data };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const register = async (name, email, password, username = "") => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        username: username || null,
      });
      setUser(data);
      return { ok: true, user: data };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
