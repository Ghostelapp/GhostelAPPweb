import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Login() {
  const { t } = useLang();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") navigate("/admin");
    else if (user) navigate("/");
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success(t("common.login") + " OK");
      navigate(res.user.role === "admin" ? "/admin" : "/");
    } else {
      setError(res.error);
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-screen relative grid place-items-center bg-zinc-950 overflow-hidden p-6">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 radial-fade" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        data-testid="login-card"
        className="relative w-full max-w-md glass-strong rounded-3xl p-8 shadow-2xl"
      >
        <Link to="/" data-testid="login-back-home" className="text-xs text-zinc-500 hover:text-cyan-400 mb-6 inline-block">
          {t("login.backHome")}
        </Link>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 grid place-items-center text-zinc-950 font-display font-black">
            G
          </div>
          <span className="font-display font-bold text-2xl text-white">Ghostel</span>
        </div>

        <h1 className="font-display text-3xl font-black tracking-tighter text-white mb-2">
          {t("login.title")}
        </h1>
        <p className="text-sm text-zinc-400 mb-8">{t("login.subtitle")}</p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <Label className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
              {t("common.email")}
            </Label>
            <Input
              data-testid="login-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 bg-white/5 border-white/10 text-white h-11 rounded-xl focus-visible:ring-cyan-400"
              placeholder="admin@ghostel.app"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
              {t("common.password")}
            </Label>
            <Input
              data-testid="login-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 bg-white/5 border-white/10 text-white h-11 rounded-xl focus-visible:ring-cyan-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div data-testid="login-error" className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button
            data-testid="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "..." : t("login.submit")}
          </Button>
        </form>

        <div className="mt-6 text-xs text-zinc-500 text-center">
          {t("login.adminHint")}
        </div>

        <div className="mt-4 text-xs text-zinc-500 text-center">
          {t("login.noAccount")}{" "}
          <Link to="/register" data-testid="login-register-link" className="text-cyan-400 hover:underline">
            {t("common.register")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
