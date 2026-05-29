import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhoneMockup from "./PhoneMockup";

export default function Hero() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <section
      data-testid="hero-section"
      className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 radial-fade" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-[120px] animate-pulse-glow" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left"
        >
          <div
            data-testid="hero-tag"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-cyan-400 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("hero.tag")}
          </div>

          <h1
            data-testid="hero-title"
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[1.05] mb-6"
          >
            <span className="neon-text">{t("hero.titleHighlight")}</span>
            <br />
            {t("hero.title")}
          </h1>

          <p
            data-testid="hero-subtitle"
            className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mb-10"
          >
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              data-testid="hero-cta-download"
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:opacity-90 text-zinc-950 font-semibold rounded-full px-7 h-12 neon-glow-cyan"
            >
              {t("hero.cta1")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              data-testid="hero-cta-register"
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="rounded-full h-12 px-7 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-cyan-400 hover:border-cyan-400/50"
            >
              {t("hero.cta2")}
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TLS 1.3
            </div>
            <div>E2EE · Curve25519</div>
            <div className="hidden sm:block">SOC 2 Ready</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}
