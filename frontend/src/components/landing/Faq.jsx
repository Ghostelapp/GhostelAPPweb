import { useLang } from "@/context/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Faq() {
  const { t, lang } = useLang();
  const items = [
    {
      q: lang === "pl" ? "Czy Ghostel działa w przeglądarce?" : "Does Ghostel work in a browser?",
      a: lang === "pl"
        ? "Tak. Pod adresem app.ghostel.app możesz zalogować się na to samo konto i korzystać z rozmów, kontaktów, połączeń oraz ustawień bez instalowania programu."
        : "Yes. At app.ghostel.app you can sign in to the same account and use chats, contacts, calls and settings without installing software.",
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
