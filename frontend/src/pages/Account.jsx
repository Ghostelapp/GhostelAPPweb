import { Link, Navigate, useNavigate } from "react-router-dom";
import { CalendarDays, Download, ExternalLink, FileText, LogOut, Smartphone, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { GHOSTEL_APP_URL } from "@/lib/constants";
import BrandLogo from "@/components/BrandLogo";
import BrandMark from "@/components/BrandMark";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Account() {
  const { t } = useLang();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0a0e14] text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const username = user.username || user.name || user.email;
  const appTarget = GHOSTEL_APP_URL === "#download" ? "/#download" : GHOSTEL_APP_URL;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <main data-testid="account-page" className="min-h-screen bg-[#0a0e14] text-white">
      <div className="absolute inset-0 subtle-grid opacity-20 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 py-8 md:py-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <BrandLogo />
            <BrandMark className="text-lg" />
          </Link>
          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Button onClick={() => navigate("/admin")} className="btn-cyan rounded-full">
                {t("common.adminPanel")}
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout} className="text-zinc-300 hover:text-white hover:bg-white/5">
              <LogOut className="w-4 h-4 mr-2" />
              {t("common.logout")}
            </Button>
          </div>
        </header>

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 pt-8">
          <div className="surface rounded-2xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 grid place-items-center text-cyan-300">
                <UserRound className="w-10 h-10" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  {t("account.profileLabel")}
                </p>
                <h1 className="font-display text-3xl font-extrabold mt-2 break-words">
                  {user.name || username}
                </h1>
                <p className="text-zinc-400 mt-1 break-words">{user.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{t("common.username")}</p>
                <p className="text-sm font-semibold mt-2 break-words">{username}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{t("common.status")}</p>
                <p className="text-sm font-semibold mt-2 text-emerald-300">{user.status || t("common.active")}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{t("common.role")}</p>
                <p className="text-sm font-semibold mt-2">{user.role || "user"}</p>
              </div>
            </div>
          </div>

          <div className="surface rounded-2xl p-6 md:p-8 flex flex-col justify-between gap-6">
            <div>
              <Smartphone className="w-8 h-8 text-cyan-300" />
              <h2 className="font-display text-xl font-bold mt-4">{t("account.appTitle")}</h2>
              <p className="text-sm text-zinc-400 mt-2 leading-6">{t("account.appDesc")}</p>
            </div>
            <Button
              onClick={() => {
                window.location.href = appTarget;
              }}
              className="btn-cyan rounded-full w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("account.openApp")}
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Link to="/privacy" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/40 transition-colors">
            <FileText className="w-5 h-5 text-cyan-300" />
            <h3 className="font-semibold mt-4">{t("footer.privacy")}</h3>
            <p className="text-sm text-zinc-500 mt-2">{t("account.privacyDesc")}</p>
          </Link>
          <Link to="/terms" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/40 transition-colors">
            <FileText className="w-5 h-5 text-cyan-300" />
            <h3 className="font-semibold mt-4">{t("footer.terms")}</h3>
            <p className="text-sm text-zinc-500 mt-2">{t("account.termsDesc")}</p>
          </Link>
          <Link to="/delete-account" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-red-400/40 transition-colors">
            <Trash2 className="w-5 h-5 text-red-300" />
            <h3 className="font-semibold mt-4">{t("nav.deleteAccount")}</h3>
            <p className="text-sm text-zinc-500 mt-2">{t("account.deleteDesc")}</p>
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <CalendarDays className="w-5 h-5 text-cyan-300" />
            <h3 className="font-semibold mt-4">{t("account.created")}</h3>
            <p className="text-sm text-zinc-500 mt-2">{formatDate(user.created_at)}</p>
          </div>
        </section>

        <footer className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-zinc-500">
          <span>{t("account.footerNote")}</span>
          <a href={appTarget} className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
            {t("account.openApp")} <ExternalLink className="w-3 h-3" />
          </a>
        </footer>
      </div>
    </main>
  );
}
