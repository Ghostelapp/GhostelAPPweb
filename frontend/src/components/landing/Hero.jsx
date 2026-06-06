import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { GHOSTEL_WEB_APP_URL } from "@/lib/constants";
import { useLatestRelease } from "@/hooks/useLatestRelease";
import PhoneMockup from "./PhoneMockup";

export default function Hero() {
  const { lang } = useLang();
  const { version, apkUrl } = useLatestRelease();
  const copy = lang === "pl"
    ? {
        tag: "Prywatna komunikacja na co dzień",
        titleLead: "Ghostel",
        title: "rozmowy pod Twoją kontrolą",
        subtitle:
          "Pisz, wysyłaj załączniki i prowadź rozmowy głosowe w aplikacji projektowanej z myślą o prywatności. Ghostel łączy szyfrowanie end-to-end, ochronę konta i wygodne powiadomienia na Androidzie.",
        primary: "Otwórz w przeglądarce",
        secondary: "Pobierz na Androida",
        signals: ["E2EE wiadomości", "2FA i blokada PIN", "Szyfrowane połączenia"],
      }
    : {
        tag: "Private communication for everyday use",
        titleLead: "Ghostel",
        title: "conversations under your control",
        subtitle:
          "Message, share attachments and make voice calls in an app designed around privacy. Ghostel combines end-to-end encryption, account protection and reliable Android notifications.",
        primary: "Open in browser",
        secondary: "Download for Android",
        signals: ["Message E2EE", "2FA and PIN lock", "Encrypted calls"],
      };

  return (
    <section
      data-testid="hero-section"
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
    >
      <div className="absolute inset-0 subtle-grid opacity-50" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-left"
        >
          <div
            data-testid="hero-tag"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md surface text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-8"
          >
            <ShieldCheck className="w-3 h-3" />
            {copy.tag}
          </div>

          <h1
            data-testid="hero-title"
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.02] mb-6"
          >
            {copy.titleLead}. <span className="text-cyan-400">{copy.title}</span>
          </h1>

          <p
            data-testid="hero-subtitle"
            className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mb-10"
          >
            {copy.subtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              data-testid="hero-cta-download"
              size="lg"
              onClick={() => (window.location.href = GHOSTEL_WEB_APP_URL)}
              className="btn-cyan rounded-md px-8 h-12 text-sm"
            >
              {copy.primary}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              asChild
              data-testid="hero-cta-register"
              size="lg"
              variant="outline"
              className="rounded-md h-12 px-7 border-white/15 bg-transparent text-white hover:bg-white/5 hover:border-white/30"
            >
              <a href={apkUrl}>
                {copy.secondary}{version ? ` v${version}` : ""}
              </a>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-400">
            {copy.signals.map((signal) => (
              <div key={signal} className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                {signal}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}
