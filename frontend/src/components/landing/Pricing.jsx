import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const { t } = useLang();
  const navigate = useNavigate();

  const plans = [
    {
      name: t("pricing.free"),
      price: "0",
      currency: "zł",
      cta: t("pricing.freeCta"),
      features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3"), t("pricing.freeF4")],
      popular: false,
      testid: "pricing-free",
    },
    {
      name: t("pricing.premium"),
      price: "19",
      currency: "zł",
      cta: t("pricing.premiumCta"),
      features: [t("pricing.premF1"), t("pricing.premF2"), t("pricing.premF3"), t("pricing.premF4"), t("pricing.premF5")],
      popular: true,
      testid: "pricing-premium",
    },
  ];

  return (
    <section id="pricing" data-testid="pricing-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">
            Pricing
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              data-testid={p.testid}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                p.popular
                  ? "glass-strong border-2 border-transparent neon-border neon-glow-cyan"
                  : "glass hover:bg-white/[0.05]"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950">
                  {t("pricing.popular")}
                </div>
              )}
              <div className="font-display text-2xl font-bold text-white mb-2">{p.name}</div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-display text-5xl font-black text-white">{p.price}</span>
                <span className="text-base text-zinc-400">{p.currency}</span>
                {p.price !== "0" && (
                  <span className="text-xs text-zinc-500">{t("pricing.perMonth")}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.popular ? "text-cyan-400" : "text-emerald-400"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                data-testid={`${p.testid}-cta`}
                onClick={() => navigate("/register")}
                className={
                  p.popular
                    ? "w-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 hover:opacity-90 h-11 rounded-full font-semibold"
                    : "w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-11 rounded-full"
                }
              >
                {p.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
