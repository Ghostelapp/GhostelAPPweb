import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { BellRing, Download, PhoneCall, ShieldCheck, UserRoundPlus, UsersRound } from "lucide-react";

export default function Features() {
  const { t } = useLang();
  const items = [
    { icon: UserRoundPlus, title: t("features.messagesTitle"), desc: t("features.messagesDesc") },
    { icon: UsersRound, title: t("features.groupsTitle"), desc: t("features.groupsDesc") },
    { icon: PhoneCall, title: t("features.voiceTitle"), desc: t("features.voiceDesc") },
    { icon: BellRing, title: t("features.filesTitle"), desc: t("features.filesDesc") },
    { icon: Download, title: t("features.pushTitle"), desc: t("features.pushDesc") },
    { icon: ShieldCheck, title: t("features.securityTitle"), desc: t("features.securityDesc") },
  ];

  return (
    <section id="features" data-testid="features-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            Core features
          </div>
          <h2 data-testid="features-title" className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t("features.title")}
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                data-testid={`feature-card-${i}`}
                className="surface surface-hover rounded-2xl p-7 group"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/20 grid place-items-center text-cyan-400 mb-5 group-hover:bg-cyan-400/15 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
