import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Lock, Timer, PhoneCall, FileLock, BellOff, ShieldCheck } from "lucide-react";

export default function Features() {
  const { t } = useLang();
  const items = [
    { icon: Lock, title: t("features.messagesTitle"), desc: t("features.messagesDesc"), span: "md:col-span-2", glow: "cyan" },
    { icon: Timer, title: t("features.groupsTitle"), desc: t("features.groupsDesc"), glow: "purple" },
    { icon: PhoneCall, title: t("features.voiceTitle"), desc: t("features.voiceDesc"), glow: "cyan" },
    { icon: FileLock, title: t("features.filesTitle"), desc: t("features.filesDesc"), glow: "purple" },
    { icon: BellOff, title: t("features.pushTitle"), desc: t("features.pushDesc"), glow: "cyan" },
    { icon: ShieldCheck, title: t("features.securityTitle"), desc: t("features.securityDesc"), span: "md:col-span-2", glow: "purple" },
  ];

  return (
    <section id="features" data-testid="features-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">
            Security-first features
          </div>
          <h2 data-testid="features-title" className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            {t("features.title")}
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                data-testid={`feature-card-${i}`}
                className={`group relative glass rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 hover:-translate-y-1 ${item.span || ""}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl grid place-items-center mb-5 ${
                    item.glow === "cyan"
                      ? "bg-cyan-400/10 text-cyan-400 group-hover:neon-glow-cyan"
                      : "bg-fuchsia-500/10 text-fuchsia-400 group-hover:neon-glow-purple"
                  } transition-shadow`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
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
