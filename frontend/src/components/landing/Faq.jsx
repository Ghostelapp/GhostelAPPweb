import { useLang } from "@/context/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Faq() {
  const { t, lang } = useLang();
  const browserFaq = {
    pl: ["Czy ghostel.app działa w przeglądarce?", "Wersja przeglądarkowa jest obecnie w budowie. Na ten moment korzystaj z aplikacji Android."],
    de: ["Funktioniert ghostel.app im Browser?", "Die Browserversion befindet sich derzeit in Entwicklung. Verwende vorerst die Android-App."],
    en: ["Does ghostel.app work in a browser?", "The browser version is currently in development. For now, use the Android app."],
    es: ["¿Funciona ghostel.app en el navegador?", "La versión web está actualmente en desarrollo. Por ahora, utiliza la aplicación para Android."],
    fr: ["ghostel.app fonctionne-t-il dans le navigateur ?", "La version web est actuellement en développement. Pour le moment, utilisez l’application Android."],
  };
  const [browserQuestion, browserAnswer] = browserFaq[lang] || browserFaq.en;
  const items = [
    {
      q: browserQuestion,
      a: browserAnswer,
    },
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  return (
    <section id="faq" data-testid="faq-section" className="relative py-24 sm:py-32 border-t divider-soft">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            FAQ
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            {t("faq.title")}
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              data-testid={`faq-item-${i}`}
              className="surface rounded-xl px-5 border-white/5"
            >
              <AccordionTrigger className="text-left font-display font-semibold text-base text-white hover:text-cyan-400 hover:no-underline py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-zinc-400 pb-5 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
