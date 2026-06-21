import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function ScrollToTop() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 360);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      data-testid="scroll-to-top"
      aria-label={t("common.backToTop")}
      title={t("common.backToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-20 z-[59] grid h-12 w-12 place-items-center rounded-full border border-cyan-400/30 bg-[#0b1016]/90 text-cyan-300 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-cyan-400 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
