import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Quote } from "lucide-react";

export default function Testimonials() {
  const { t } = useLang();
  const items = [
    { text: t("testimonials.t1"), author: t("testimonials.t1Author"), role: t("testimonials.t1Role") },
    { text: t("testimonials.t2"), author: t("testimonials.t2Author"), role: t("testimonials.t2Role") },
    { text: t("testimonials.t3"), author: t("testimonials.t3Author"), role: t("testimonials.t3Role") },
  ];

  return (
    <section data-testid="testimonials-section" className="relative py-24 sm:py-32 border-y divider-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            Testimonials
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-base text-zinc-400">{t("testimonials.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              data-testid={`testimonial-${i}`}
              className="surface surface-hover rounded-2xl p-7"
            >
              <Quote className="w-6 h-6 text-cyan-400 mb-4" />
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">"{it.text}"</p>
              <div className="pt-4 border-t divider-soft">
                <div className="text-sm font-semibold text-white">{it.author}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{it.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
