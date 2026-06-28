import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";

function forceWindowScrollTop(options = {}) {
  window.scrollTo({ top: 0, left: 0, ...options });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export default function ScrollToTop() {
  const { t } = useLang();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 360);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (location.hash) {
        try {
          const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
          if (target) {
            target.scrollIntoView({ behavior: "auto", block: "start" });
            return;
          }
        } catch {
          // Fall back to the top of the new page if the hash is malformed.
        }
      }

      forceWindowScrollTop({ behavior: "auto" });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [location.key, location.pathname, location.search, location.hash]);

  useEffect(() => {
    const onSupportToggle = (event) => setSupportOpen(Boolean(event.detail?.open));
    window.addEventListener("ghostel:support-widget", onSupportToggle);
    return () => window.removeEventListener("ghostel:support-widget", onSupportToggle);
  }, []);

  if (!visible || supportOpen || location.pathname.startsWith("/admin")) return null;

  return (
    <button
      type="button"
      data-testid="scroll-to-top"
      aria-label={t("common.backToTop")}
      title={t("common.backToTop")}
      onClick={() => forceWindowScrollTop({ behavior: "smooth" })}
      className="fixed bottom-24 right-5 z-[59] grid h-12 w-12 place-items-center rounded-full border border-cyan-400/30 bg-[#0b1016]/90 text-cyan-300 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-cyan-400 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:bottom-28"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
