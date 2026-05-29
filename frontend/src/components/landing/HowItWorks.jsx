import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";

export default function HowItWorks() {
  const { t } = useLang();
  const steps = [
    { n: "01", title: t("how.step1"), desc: t("how.step1Desc") },
    { n: "02", title: t("how.step2"), desc: t("how.step2Desc") },
    { n: "03", title: t("how.step3"), desc: t("how.step3Desc") },
    { n: "04", title: t("how.step4"), desc: t("how.step4Desc") },
  ];

  return (
    <section id="how" data-testid="how-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">
            Process
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            {t("how.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("how.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              data-testid={`how-step-${i}`}
              className="relative glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="font-display text-5xl font-black neon-text mb-4">
                {s.n}
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-zinc-400">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-cyan-400/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
