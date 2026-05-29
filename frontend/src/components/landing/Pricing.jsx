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
      currency: "$",
      cta: t("pricing.freeCta"),
      features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3"), t("pricing.freeF4")],
      popular: false,
      testid: "pricing-free",
      onClick: () => navigate("/register"),
    },
    {
      name: t("pricing.premium"),
      price: "9",
      currency: "$",
      cta: t("pricing.premiumCta"),
      features: [t("pricing.premF1"), t("pricing.premF2"), t("pricing.premF3"), t("pricing.premF4"), t("pricing.premF5")],
      popular: true,
      testid: "pricing-premium",
      onClick: () => navigate("/register"),
    },
    {
      name: t("pricing.enterprise"),
      price: null,
      cta: t("pricing.contactSales"),
      features: [t("pricing.entF1"), t("pricing.entF2"), t("pricing.entF3"), t("pricing.entF4"), t("pricing.entF5")],
      popular: false,
      testid: "pricing-enterprise",
      onClick: () => (window.location.href = "mailto:sales@ghostel.app"),
    },
  ];

  return (
    <section id="pricing" data-testid="pricing-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            Pricing
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("pricing.subtitle")}</p>
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
              <div className="flex items-baseline gap-1.5 mb-7 min-h-[58px]">
                {p.price !== null ? (
                  <>
                    <span className="text-base text-zinc-400">{p.currency}</span>
                    <span className="font-display text-5xl font-extrabold text-white">{p.price}</span>
                    {p.price !== "0" && (
                      <span className="text-xs text-zinc-500 ml-1">{t("pricing.perMonth")}</span>
                    )}
                  </>
                ) : (
                  <span className="font-display text-3xl font-extrabold text-white">Custom</span>
                )}
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
                {p.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
