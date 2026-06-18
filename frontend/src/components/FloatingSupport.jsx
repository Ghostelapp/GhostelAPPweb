import { Link, useLocation } from "react-router-dom";
import { LifeBuoy, MessageCircle } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const copy = {
  pl: {
    label: "Support",
    title: "Potrzebujesz pomocy?",
    subtitle: "Napisz do Ghostel Support",
  },
  en: {
    label: "Support",
    title: "Need help?",
    subtitle: "Contact Ghostel Support",
  },
  de: {
    label: "Support",
    title: "Brauchst du Hilfe?",
    subtitle: "Ghostel Support kontaktieren",
  },
};

export default function FloatingSupport() {
  const { lang } = useLang();
  const location = useLocation();
  const text = copy[lang] || copy.en;

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <Link
      to="/contact"
      data-testid="floating-support-button"
      aria-label={text.subtitle}
      className="fixed bottom-5 right-5 z-[60] group"
    >
      <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-cyan-400/25 bg-[#071018]/90 px-4 py-3 text-left shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-[#0a1420]">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-zinc-950">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div className="pr-1">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            {text.label}
          </div>
          <div className="text-sm font-semibold text-white">{text.title}</div>
          <div className="text-xs text-zinc-400">{text.subtitle}</div>
        </div>
      </div>

      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-zinc-950 shadow-2xl shadow-cyan-950/50 transition-transform hover:-translate-y-0.5 sm:hidden">
        <MessageCircle className="h-6 w-6" />
      </div>
    </Link>
  );
}
