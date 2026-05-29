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
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            Process
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t("how.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("how.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              data-testid={`how-step-${i}`}
              className="surface surface-hover rounded-2xl p-6"
            >
              <div className="font-display text-sm font-bold text-cyan-400 mb-3 tracking-widest">
                {s.n}
              </div>
              <h3 className="font-display text-base font-bold text-white mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
