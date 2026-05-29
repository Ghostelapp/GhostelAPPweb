import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Star } from "lucide-react";

const AVATARS = [
  "https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?w=200",
  "https://images.unsplash.com/photo-1764545973653-94c40d993495?w=200",
  "https://images.unsplash.com/photo-1765776830139-72b2184dae5a?w=200",
];

export default function Testimonials() {
  const { t } = useLang();
  const items = [
    { text: t("testimonials.t1"), author: t("testimonials.t1Author"), role: t("testimonials.t1Role"), avatar: AVATARS[0] },
    { text: t("testimonials.t2"), author: t("testimonials.t2Author"), role: t("testimonials.t2Role"), avatar: AVATARS[1] },
    { text: t("testimonials.t3"), author: t("testimonials.t3Author"), role: t("testimonials.t3Role"), avatar: AVATARS[2] },
  ];

  return (
    <section data-testid="testimonials-section" className="relative py-24 sm:py-32 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400 mb-4">
            Testimonials
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("testimonials.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              data-testid={`testimonial-${i}`}
              className="glass rounded-2xl p-7 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                ))}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">"{it.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <img
                  src={it.avatar}
                  alt={it.author}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <div className="text-sm font-semibold text-white">{it.author}</div>
                  <div className="text-xs text-zinc-500">{it.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
