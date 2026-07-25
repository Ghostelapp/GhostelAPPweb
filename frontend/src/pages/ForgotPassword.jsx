import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import { GHOSTEL_MOBILE_API_URL } from "@/lib/constants";

export default function ForgotPassword() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const requestReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${GHOSTEL_MOBILE_API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSentEmail(email);
        setStep(2);
        toast.success(t("forgotPassword.codeSent"));
        
        // Jeśli backend zwrócił kod (dev mode), pokaż go w konsoli
        if (data.code) {
          console.log("Reset code:", data.code);
        }
      } else {
        setError(data.detail || t("forgotPassword.requestFailed"));
        toast.error(data.detail || t("forgotPassword.requestFailed"));
      }
    } catch (err) {
      setError(t("forgotPassword.networkError"));
      toast.error(t("forgotPassword.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // Walidacja
    if (code.length !== 6) {
      setError(t("forgotPassword.codeInvalid"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("forgotPassword.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("forgotPassword.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${GHOSTEL_MOBILE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sentEmail,
          code,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t("forgotPassword.resetSuccess"));
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.detail || t("forgotPassword.resetFailed"));
        toast.error(data.detail || t("forgotPassword.resetFailed"));
      }
    } catch (err) {
      setError(t("forgotPassword.networkError"));
      toast.error(t("forgotPassword.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative grid place-items-center bg-[#0a0e14] overflow-hidden p-6">
      <div className="absolute inset-0 subtle-grid opacity-30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md surface rounded-2xl p-8 shadow-2xl"
      >
        <Link to="/login" className="text-xs text-zinc-500 hover:text-cyan-400 mb-6 inline-block">
          {t("forgotPassword.backToLogin")}
        </Link>

        <div className="flex flex-col items-center text-center mb-8">
          <BrandLogo className="h-16 w-16 mb-4" />
          <h1 className="font-display text-2xl font-extrabold text-white mb-1">
            {step === 1 ? t("forgotPassword.title") : t("forgotPassword.resetTitle")}
          </h1>
          <p className="text-sm text-zinc-400 mt-3">
            {step === 1 ? t("forgotPassword.subtitle") : t("forgotPassword.resetSubtitle")}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={requestReset} className="space-y-5">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {t("common.email")}
              </Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 bg-[#0a0e14] border-white/10 text-white h-11 rounded-lg focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40"
                placeholder="twoj@email.pl"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 btn-cyan rounded-full disabled:opacity-50"
            >
              {loading ? "..." : t("forgotPassword.sendCode")}
            </Button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-5">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {t("forgotPassword.codeLabel")}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="mt-2 bg-[#0a0e14] border-white/10 text-white h-11 rounded-lg focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40 text-center text-lg tracking-widest"
                placeholder="000000"
                autoFocus
              />
              <p className="text-xs text-zinc-500 mt-2">{t("forgotPassword.codeSentTo")} {sentEmail}</p>
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {t("forgotPassword.newPassword")}
              </Label>
              <Input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 bg-[#0a0e14] border-white/10 text-white h-11 rounded-lg focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40"
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {t("forgotPassword.confirmPassword")}
              </Label>
              <Input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 bg-[#0a0e14] border-white/10 text-white h-11 rounded-lg focus-visible:ring-cyan-400 focus-visible:border-cyan-400/40"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 btn-cyan rounded-full disabled:opacity-50"
            >
              {loading ? "..." : t("forgotPassword.resetPassword")}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
              }}
              className="w-full text-xs text-zinc-500 hover:text-cyan-400 mt-2"
            >
              {t("forgotPassword.backToEmail")}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
