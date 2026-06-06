import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, Download, Globe2, MonitorDown } from "lucide-react";
import {
  GHOSTEL_APK_URL,
  GHOSTEL_DESKTOP_URL,
  GHOSTEL_WEB_APP_URL,
} from "@/lib/constants";

export default function Pricing() {
  const { t, lang } = useLang();
  const directDownload = () => (window.location.href = GHOSTEL_APK_URL);
  const desktopDownload = () => (window.location.href = GHOSTEL_DESKTOP_URL);
  const openWebApp = () => (window.location.href = GHOSTEL_WEB_APP_URL);

  const plans = [
    {
      name: lang === "pl" ? "Wersja webowa" : "Web app",
      label: "app.ghostel.app",
      cta: lang === "pl" ? "Otwórz w przeglądarce" : "Open in browser",
      features: lang === "pl"
        ? ["Bez instalowania programu", "To samo konto i kontakty", "Czat, połączenia i ustawienia", "Możliwość instalacji jako PWA"]
        : ["No software installation", "The same account and contacts", "Chat, calls and settings", "Installable as a PWA"],
      popular: true,
      testid: "pricing-web",
      onClick: openWebApp,
      icon: Globe2,
    },
    {
      name: t("pricing.free"),
      label: "APK 1.4.0",
      cta: lang === "pl" ? "Pobierz APK na Androida" : "Download Android APK",
      features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3"), t("pricing.freeF4")],
      popular: false,
      testid: "pricing-android",
      onClick: directDownload,
      icon: Download,
    },
    {
      name: lang === "pl" ? "Wersja desktopowa" : "Desktop app",
      label: "Windows 10/11",
      cta: lang === "pl" ? "Pobierz na Windows" : "Download for Windows",
      features: lang === "pl"
        ? ["Osobna aplikacja na komputer", "To samo konto i rozmowy", "Skrót na pulpicie i w menu Start", "Automatyczne połączenie z Ghostel"]
        : ["Standalone desktop application", "The same account and conversations", "Desktop and Start menu shortcuts", "Automatic connection to Ghostel"],
      popular: false,
      testid: "pricing-desktop",
      onClick: desktopDownload,
      icon: MonitorDown,
    },
  ];

  return (
    <section id="download" data-testid="download-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            {lang === "pl" ? "Pobieranie" : "Download"}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {lang === "pl" ? "Korzystaj tak, jak Ci wygodnie" : "Use Ghostel your way"}
          </h2>
          <p className="text-base text-zinc-400">
            {lang === "pl"
              ? "Otwórz Ghostel w przeglądarce albo pobierz aplikację na Androida lub Windows."
              : "Open Ghostel in your browser or download the Android or Windows app."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              data-testid={p.testid}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                p.popular
                  ? "surface border-cyan-400/40 cyan-glow-soft"
                  : "surface surface-hover"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-400 text-[#0a0e14]">
                  {t("pricing.popular")}
                </div>
              )}
              <div className="font-display text-xl font-bold text-white mb-2">{p.name}</div>
              <div className="mb-7 min-h-[58px] flex items-center">
                <span className="font-display text-3xl font-extrabold text-white">{p.label}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                data-testid={`${p.testid}-cta`}
                onClick={p.onClick}
                className={
                  p.popular
                    ? "w-full btn-cyan h-11 rounded-full"
                    : "w-full bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 h-11 rounded-full"
                }
              >
                {p.icon ? <p.icon className="w-4 h-4 mr-2" /> : null}
                {p.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
