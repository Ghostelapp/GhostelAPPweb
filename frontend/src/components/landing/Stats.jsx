import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LanguageContext";

function Counter({ to, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (timestamp, startTime) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setVal(Math.floor(start + (to - start) * progress));
      if (progress < 1) requestAnimationFrame((t) => step(t, startTime));
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="font-display text-5xl sm:text-6xl font-black neon-text tabular-nums">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const { t } = useLang();
  const items = [
    { value: 99, suffix: ".9%", label: t("stats.uptime") },
    { value: 250000, suffix: "+", label: t("stats.messages") },
    { value: 12000, suffix: "+", label: t("stats.conversations") },
    { value: 100, suffix: "%", label: t("stats.secure") },
  ];

  return (
    <section data-testid="stats-section" className="relative py-20 sm:py-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-10 sm:p-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              data-testid={`stat-${i}`}
              className="text-left"
            >
              <Counter to={it.value} suffix={it.suffix} />
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                {it.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
