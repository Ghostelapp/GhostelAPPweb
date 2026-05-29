import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: t("nav.features") },
    { href: "#why", label: t("nav.why") },
    { href: "#how", label: t("nav.how") },
    { href: "#pricing", label: t("nav.pricing") },
    { href: "#faq", label: t("nav.faq") },
  ];

  return (
    <header
      data-testid="landing-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 neon-glow-cyan grid place-items-center text-zinc-950 font-display font-black">
            G
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Ghostel
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.href.replace("#", "")}`}
              className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            data-testid="lang-toggle"
            onClick={() => setLang(lang === "pl" ? "en" : "pl")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-semibold text-zinc-300 hover:text-cyan-400 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang.toUpperCase()}
          </button>

          {user ? (
            <>
              {user.role === "admin" && (
                <Button
                  data-testid="navbar-admin-btn"
                  onClick={() => navigate("/admin")}
                  className="hidden sm:inline-flex bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 text-zinc-950 font-semibold rounded-full px-5"
                >
                  {t("common.adminPanel")}
                </Button>
              )}
              <Button
                data-testid="navbar-logout-btn"
                variant="ghost"
                onClick={logout}
                className="text-zinc-300 hover:text-white"
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
                className="hidden sm:inline-flex text-zinc-300 hover:text-white hover:bg-white/5 rounded-full"
              >
                {t("common.login")}
              </Button>
              <Button
                data-testid="navbar-register-btn"
                onClick={() => navigate("/register")}
                className="hidden sm:inline-flex bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 text-zinc-950 font-semibold rounded-full px-5"
              >
                {t("common.register")}
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
            className="lg:hidden glass-strong border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-zinc-300 hover:text-cyan-400 py-2"
                >
                  {l.label}
                </a>
              ))}
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="flex-1 text-zinc-200"
                >
                  {t("common.login")}
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-zinc-950 font-semibold"
                >
                  {t("common.register")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
