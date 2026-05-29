import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Zap, MousePointer, Wifi, Lock, Smartphone, Radio } from "lucide-react";

export default function WhyGhostel() {
  const { t } = useLang();
  const items = [
    { icon: Zap, title: t("why.speed"), desc: t("why.speedDesc") },
    { icon: MousePointer, title: t("why.intuitive"), desc: t("why.intuitiveDesc") },
    { icon: Wifi, title: t("why.stable"), desc: t("why.stableDesc") },
    { icon: Lock, title: t("why.secure"), desc: t("why.secureDesc") },
    { icon: Smartphone, title: t("why.mobile"), desc: t("why.mobileDesc") },
    { icon: Radio, title: t("why.realtime"), desc: t("why.realtimeDesc") },
  ];

  return (
    <section id="why" data-testid="why-section" className="relative py-24 sm:py-32 border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400 mb-4">
            Why us
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            {t("why.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("why.subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                data-testid={`why-card-${i}`}
                className="group flex gap-4 p-6 rounded-2xl hover:bg-white/[0.03] transition-all duration-300 border border-transparent hover:border-white/10"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-white/10 grid place-items-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
