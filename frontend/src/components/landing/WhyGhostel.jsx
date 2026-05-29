import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Lock, KeyRound, FileCheck2, Download, MonitorSmartphone, ShieldCheck } from "lucide-react";

export default function WhyGhostel() {
  const { t } = useLang();
  const items = [
    { icon: Lock, title: t("why.speed"), desc: t("why.speedDesc") },
    { icon: KeyRound, title: t("why.intuitive"), desc: t("why.intuitiveDesc") },
    { icon: FileCheck2, title: t("why.stable"), desc: t("why.stableDesc") },
    { icon: Download, title: t("why.secure"), desc: t("why.secureDesc") },
    { icon: MonitorSmartphone, title: t("why.mobile"), desc: t("why.mobileDesc") },
    { icon: ShieldCheck, title: t("why.realtime"), desc: t("why.realtimeDesc") },
  ];

  return (
    <section id="why" data-testid="why-section" className="relative py-24 sm:py-32 border-y divider-soft">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            Security &amp; Compliance
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t("why.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("why.subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                data-testid={`why-card-${i}`}
                className="flex gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 grid place-items-center text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
