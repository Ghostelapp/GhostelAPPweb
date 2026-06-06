import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GHOSTEL_APP_URL } from "@/lib/constants";
import PhoneMockup from "./PhoneMockup";

export default function Hero() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <section
      data-testid="hero-section"
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 subtle-grid opacity-50" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-left"
        >
          <div
            data-testid="hero-tag"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full surface text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-8"
          >
            <ShieldCheck className="w-3 h-3" />
            {t("hero.tag")}
          </div>

          <h1
            data-testid="hero-title"
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.02] mb-6"
          >
            {t("hero.titleHighlight")}{" "}
            <span className="text-cyan-400">{t("hero.title")}</span>
          </h1>

          <p
            data-testid="hero-subtitle"
            className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mb-10"
          >
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              data-testid="hero-cta-download"
              size="lg"
              onClick={() => (window.location.href = GHOSTEL_APP_URL)}
              className="btn-cyan rounded-full px-8 h-12 text-sm"
            >
              {t("hero.cta1")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              data-testid="hero-cta-register"
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="rounded-full h-12 px-7 border-white/15 bg-transparent text-white hover:bg-white/5 hover:border-white/30"
            >
              Admin panel
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-soft" />
              Push notifications
            </div>
            <div className="text-zinc-700">·</div>
            <div>Voice calls</div>
            <div className="text-zinc-700">·</div>
            <div className="hidden sm:block">Account controls</div>
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
