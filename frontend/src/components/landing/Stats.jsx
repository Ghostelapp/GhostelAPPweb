import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LanguageContext";

function Counter({ to, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const step = (timestamp, startTime) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setVal(Math.floor(to * progress));
      if (progress < 1) requestAnimationFrame((t) => step(t, startTime));
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="font-display text-5xl sm:text-6xl font-extrabold text-white tabular-nums">
      {val.toLocaleString()}
      <span className="text-cyan-400">{suffix}</span>
    </span>
  );
}

export default function Stats() {
  const { t } = useLang();
  const items = [
    { value: 2, suffix: "", label: t("stats.uptime") },
    { value: 2, suffix: "", label: t("stats.messages") },
    { value: 3, suffix: "", label: t("stats.conversations") },
    { value: 4, suffix: "", label: t("stats.secure") },
  ];

  return (
    <section data-testid="stats-section" className="relative py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="surface rounded-3xl p-10 sm:p-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              data-testid={`stat-${i}`}
              className="text-left"
            >
              <Counter to={it.value} suffix={it.suffix} />
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                {it.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
