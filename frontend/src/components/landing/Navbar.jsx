import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { nextLanguage, useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { section: "features", label: t("nav.features") },
    { section: "why", label: t("nav.why") },
    { section: "how", label: t("nav.how") },
    { section: "download", label: t("common.download") },
    { section: "faq", label: t("nav.faq") },
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/30 grid place-items-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Ghostel
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.href || l.section}
              type="button"
              onClick={() => goToLink(l)}
              data-testid={`nav-link-${l.href ? l.href.replace("/", "") : l.section}`}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            data-testid="lang-toggle"
            onClick={() => setLang(nextLanguage(lang))}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full surface text-[11px] font-semibold text-zinc-300 hover:text-cyan-400 transition-colors"
          >
            <Globe className="w-3 h-3" />
            {lang.toUpperCase()}
          </button>

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
              <Button
                data-testid="navbar-register-btn"
                disabled
                className="hidden sm:inline-flex rounded-full px-5 h-9 text-sm bg-white/[0.04] text-zinc-500"
              >
                Ghostel Web · {lang === "pl" ? "w budowie" : lang === "de" ? "in Entwicklung" : "in development"}
              </Button>
            </>
          )}

          <button
            data-testid="navbar-mobile-toggle"
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-zinc-300"
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
            className="lg:hidden bg-[#0a0e14] border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <button
                  key={l.href || l.section}
                  type="button"
                  onClick={() => goToLink(l)}
                  className="text-left text-sm text-zinc-300 hover:text-cyan-400 py-2"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex gap-3 pt-3 border-t border-white/5">
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
                    <Button
                      disabled
                      className="flex-1 bg-white/[0.04] text-zinc-500"
                    >
                      Ghostel Web · {lang === "pl" ? "w budowie" : lang === "de" ? "in Entwicklung" : "in development"}
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
