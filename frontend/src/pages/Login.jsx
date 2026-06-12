import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";

export default function Login() {
  const { t } = useLang();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") navigate("/admin");
    else if (user) navigate("/account");
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password, totpCode);
    setLoading(false);
    if (res.ok) {
      toast.success("Signed in");
      navigate(res.user.role === "admin" ? "/admin" : "/account");
    } else if (res.requires_2fa) {
      setRequires2FA(true);
      setError("");
    } else {
      setError(res.error);
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-screen relative grid place-items-center bg-[#0a0e14] overflow-hidden p-6">
      <div className="absolute inset-0 subtle-grid opacity-30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        data-testid="login-card"
        className="relative w-full max-w-md surface rounded-2xl p-8 shadow-2xl"
      >
        <Link to="/" data-testid="login-back-home" className="text-xs text-zinc-500 hover:text-cyan-400 mb-6 inline-block">
          {t("login.backHome")}
        </Link>
        <div className="flex flex-col items-center text-center mb-8">
          <BrandLogo className="h-16 w-16 mb-4" />
          <h1 className="font-display text-2xl font-extrabold text-white mb-1">
            {t("login.title")}
          </h1>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
            ghostel.app account
          </div>
          <p className="text-sm text-zinc-400 mt-3">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {t("common.email")}
            </Label>
            <Input
              data-testid="login-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 bg-[#0a0e14] border-white/10 text-white h-11 rounded-lg focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40"
              placeholder="twoj@email.pl"
            />
          </div>
          {requires2FA && (
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                2FA code
              </Label>
              <Input
                data-testid="login-totp-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                minLength={6}
                maxLength={8}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                className="mt-2 bg-[#0a0e14] border-white/10 text-white h-11 rounded-lg focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40"
                placeholder="123456"
                autoFocus
              />
            </div>
          )}
          <div>
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {t("common.password")}
            </Label>
            <Input
              data-testid="login-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 bg-[#0a0e14] border-white/10 text-white h-11 rounded-lg focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40"
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
            className="w-full h-11 btn-cyan rounded-full disabled:opacity-50"
          >
            {loading ? "..." : t("login.submit")}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t divider-soft text-xs text-zinc-500 text-center">
          {t("login.adminHint")}
        </div>

        <div className="mt-3 text-xs text-zinc-500 text-center">
          {t("login.noAccount")}{" "}
          <Link to="/register" data-testid="login-register-link" className="text-cyan-400 hover:underline">
            {t("common.register")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
