import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Check, Minus, ShieldCheck, Smartphone, X } from "lucide-react";

const marks = {
  yes: ["text-emerald-300 bg-emerald-300/10 border-emerald-300/20", Check],
  partial: ["text-amber-300 bg-amber-300/10 border-amber-300/20", Minus],
  no: ["text-zinc-500 bg-zinc-500/10 border-zinc-500/20", X],
};

function Mark({ value }) {
  const [className, Icon] = marks[value] || marks.partial;
  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${className}`}>
      <Icon className="h-4 w-4" />
    </span>
  );
}

export default function Comparison() {
  const { lang } = useLang();
  const copy = lang === "pl"
    ? {
        eyebrow: "Porównanie",
        title: "Ghostel kontra Telegram, Messenger i WhatsApp",
        subtitle: "Ghostel jest budowany jako prywatny komunikator skupiony na realnych rozmowach z Androida, kontroli konta i przejrzystych zabezpieczeniach. Duże aplikacje są świetne masowo, ale często mają więcej kompromisów i hałasu.",
        columns: ["Funkcja", "Ghostel", "Telegram", "Messenger", "WhatsApp"],
        rows: [
          ["Szyfrowanie treści wiadomości end-to-end w rozmowach", "yes", "partial", "partial", "yes"],
          ["Szyfrowane załączniki i zdjęcia jednorazowe 5 s", "yes", "partial", "partial", "partial"],
          ["Pełnoekranowe alerty połączeń na Androidzie", "yes", "partial", "partial", "partial"],
          ["Eksport danych i usunięcie konta z aplikacji", "yes", "partial", "partial", "partial"],
          ["Bez publicznych kanałów, reklam i społecznościowego szumu", "yes", "partial", "no", "partial"],
          ["Szybkie dopasowanie produktu i własnych funkcji", "yes", "no", "no", "no"],
        ],
        legend: ["mocna strona", "zależy od trybu lub konfiguracji", "nie jest głównym założeniem"],
        cards: [
          ["Prywatność jako domyślne założenie", "Ghostel nie jest siecią społecznościową. Skupia się na rozmowie, kontakcie i kontroli danych użytkownika.", ShieldCheck],
          ["Android first", "Połączenia, push i ekran odbierania są dopracowywane pod realne testy na telefonach z Androidem.", Smartphone],
        ],
        note: "Porównanie opisuje kierunek produktu i aktualne funkcje Ghostel. Telegram, Messenger i WhatsApp są znakami towarowymi swoich właścicieli.",
      }
    : lang === "de"
    ? {
        eyebrow: "Vergleich",
        title: "Ghostel im Vergleich zu Telegram, Messenger und WhatsApp",
        subtitle: "Ghostel wird als privater Messenger für echte Android-Gespräche, Kontokontrolle und transparente Sicherheit gebaut. Große Apps sind stark in der Masse, bringen aber oft mehr Kompromisse und Ablenkung mit.",
        columns: ["Funktion", "Ghostel", "Telegram", "Messenger", "WhatsApp"],
        rows: [
          ["Ende-zu-Ende-Verschlüsselung von Nachrichteninhalten", "yes", "partial", "partial", "yes"],
          ["Verschlüsselte Anhänge und 5-Sekunden-Einmalfotos", "yes", "partial", "partial", "partial"],
          ["Vollbild-Anrufhinweise auf Android", "yes", "partial", "partial", "partial"],
          ["Datenexport und Kontolöschung in der App", "yes", "partial", "partial", "partial"],
          ["Keine öffentlichen Kanäle, Werbung oder Social-Media-Ablenkung", "yes", "partial", "no", "partial"],
          ["Schnelle Produktanpassung für eigene Funktionen", "yes", "no", "no", "no"],
        ],
        legend: ["starke Seite", "abhängig von Modus oder Konfiguration", "nicht der Hauptfokus"],
        cards: [
          ["Datenschutz als Grundprinzip", "Ghostel ist kein soziales Netzwerk. Der Fokus liegt auf Gesprächen, Kontakten und Kontrolle über eigene Daten.", ShieldCheck],
          ["Android first", "Anrufe, Push und der Annahmebildschirm werden anhand realer Android-Tests optimiert.", Smartphone],
        ],
        note: "Der Vergleich beschreibt die Produktausrichtung und aktuelle Ghostel-Funktionen. Telegram, Messenger und WhatsApp sind Marken ihrer jeweiligen Eigentümer.",
      }
    : {
        eyebrow: "Comparison",
        title: "Ghostel vs Telegram, Messenger and WhatsApp",
        subtitle: "Ghostel is built as a private messenger focused on real Android calls, account control and transparent protections. Large apps are excellent at scale, but they often include more compromise and noise.",
        columns: ["Feature", "Ghostel", "Telegram", "Messenger", "WhatsApp"],
        rows: [
          ["End-to-end encryption for message content", "yes", "partial", "partial", "yes"],
          ["Encrypted attachments and 5-second view-once photos", "yes", "partial", "partial", "partial"],
          ["Full-screen Android incoming call alerts", "yes", "partial", "partial", "partial"],
          ["In-app data export and account deletion", "yes", "partial", "partial", "partial"],
          ["No public channels, ads or social-network noise", "yes", "partial", "no", "partial"],
          ["Fast product changes for custom features", "yes", "no", "no", "no"],
        ],
        legend: ["strong fit", "depends on mode or configuration", "not the main focus"],
        cards: [
          ["Privacy as the product baseline", "Ghostel is not a social network. It focuses on conversations, contacts and user data control.", ShieldCheck],
          ["Android first", "Calls, push and the answer screen are tuned through real tests on Android phones.", Smartphone],
        ],
        note: "This comparison describes Ghostel's product direction and current features. Telegram, Messenger and WhatsApp are trademarks of their respective owners.",
      };

  return (
    <section id="comparison" data-testid="comparison-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">{copy.eyebrow}</div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">{copy.title}</h2>
          <p className="text-base text-zinc-400 leading-relaxed">{copy.subtitle}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-cyan-950/10">
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.035]">
                  {copy.columns.map((column, index) => (
                    <th key={column} className={`px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] ${index === 1 ? "text-cyan-300" : "text-zinc-400"}`}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.rows.map((row, index) => (
                  <motion.tr key={row[0]} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-5 py-4 text-sm text-zinc-200 font-medium">{row[0]}</td>
                    {row.slice(1).map((value, cellIndex) => <td key={`${row[0]}-${cellIndex}`} className="px-5 py-4"><Mark value={value} /></td>)}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-zinc-400">
          {["yes", "partial", "no"].map((value, index) => <span key={value} className="inline-flex items-center gap-2"><Mark value={value} /> {copy.legend[index]}</span>)}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {copy.cards.map(([title, desc, Icon], index) => (
            <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="surface rounded-xl p-6 flex gap-4">
              <div className="shrink-0 h-11 w-11 rounded-lg border border-cyan-400/20 bg-cyan-400/10 grid place-items-center text-cyan-400"><Icon className="h-5 w-5" /></div>
              <div><h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3><p className="text-sm text-zinc-400 leading-relaxed">{desc}</p></div>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-xs text-zinc-500 leading-relaxed">{copy.note}</p>
      </div>
    </section>
  );
}
