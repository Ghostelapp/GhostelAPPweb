import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Download, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LanguageMenu from "@/components/LanguageMenu";
import { useLatestRelease } from "@/hooks/useLatestRelease";

export default function Navbar() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const { version, apkUrl } = useLatestRelease();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryLinks = [
    { section: "features", label: t("nav.features") },
    { section: "why", label: t("nav.why") },
    { section: "comparison", label: t("nav.comparison") },
    { section: "download", label: t("nav.download") },
    { section: "faq", label: t("nav.faq") },
  ];
  const mobileLinks = [
    ...primaryLinks,
    { href: "/privacy", label: t("nav.privacy") },
    { href: "/delete-account", label: t("nav.deleteAccount") },
  ];

  const goToLink = (link) => {
    setOpen(false);
    if (link.href) {
      navigate(link.href);
      return;
    }

    const scrollToSection = () => {
      document.getElementById(link.section)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (location.pathname !== "/") {
      navigate(`/#${link.section}`);
      window.setTimeout(scrollToSection, 80);
    } else {
      window.history.replaceState(null, "", `#${link.section}`);
      scrollToSection();
    }
  };

  return (
    <header
      data-testid="landing-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0e14]/85 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/30 grid place-items-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Ghostel
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1">
          {primaryLinks.map((l) => (
            <button
              key={l.href || l.section}
              type="button"
              onClick={() => goToLink(l)}
              data-testid={`nav-link-${l.href ? l.href.replace("/", "") : l.section}`}
              className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageMenu compact />
          </div>

          <a
            href={apkUrl}
            data-testid="navbar-apk-download"
            className="hidden md:inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-xs font-bold text-[#071018] transition-colors hover:bg-cyan-300"
          >
            <Download className="h-4 w-4" />
            Android {version ? `v${version}` : "APK"}
          </a>

          {user ? (
            <>
              {user.role !== "admin" && (
                <Button
                  data-testid="navbar-account-btn"
                  onClick={() => navigate("/account")}
                  className="hidden sm:inline-flex btn-cyan rounded-full px-5 h-9 text-sm"
                >
                  {t("common.account")}
                </Button>
              )}
              {user.role === "admin" && (
                <Button
                  data-testid="navbar-admin-btn"
                  onClick={() => navigate("/admin")}
                  className="hidden sm:inline-flex btn-cyan rounded-full px-5 h-9 text-sm"
                >
                  {t("common.adminPanel")}
                </Button>
              )}
              <Button
                data-testid="navbar-logout-btn"
                variant="ghost"
                onClick={logout}
                className="text-zinc-300 hover:text-white hover:bg-white/5"
              >
                {t("common.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                data-testid="navbar-login-btn"
                variant="ghost"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex text-zinc-300 hover:text-white hover:bg-white/5 rounded-full h-9"
              >
                {t("common.login")}
              </Button>
            </>
          )}

          <button
            data-testid="navbar-mobile-toggle"
            onClick={() => setOpen(!open)}
            className="xl:hidden rounded-lg p-2 text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="xl:hidden border-t border-white/10 bg-[#080c12]/98 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6">
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-2">
                <LanguageMenu compact />
                <a
                  href={apkUrl}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 text-xs font-bold text-[#071018] transition-colors hover:bg-cyan-300"
                >
                  <Download className="h-4 w-4" />
                  Android {version ? `v${version}` : "APK"}
                </a>
              </div>
              <div className="grid gap-1">
              {mobileLinks.map((l) => (
                <button
                  key={l.href || l.section}
                  type="button"
                  onClick={() => goToLink(l)}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-cyan-400"
                >
                  {l.label}
                </button>
              ))}
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                {user ? (
                  <>
                    <Button
                      onClick={() => navigate(user.role === "admin" ? "/admin" : "/account")}
                      className="flex-1 btn-cyan"
                    >
                      {user.role === "admin" ? t("common.adminPanel") : t("common.account")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className="flex-1 text-zinc-200"
                    >
                      {t("common.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/login")}
                      className="flex-1 text-zinc-200"
                    >
                      {t("common.login")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
