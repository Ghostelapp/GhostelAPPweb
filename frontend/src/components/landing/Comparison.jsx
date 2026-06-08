import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Check, Minus, ShieldCheck, Smartphone, X } from "lucide-react";

const brands = [
  {
    key: "ghostel",
    name: "Ghostel",
    Logo: () => (
      <div className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-cyan-300/40 bg-cyan-300/15 p-1.5 shadow-lg shadow-cyan-950/40">
        <img src="/ghostel-logo.png" alt="" className="h-full w-full object-contain" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
      </div>
    ),
  },
  {
    key: "telegram",
    name: "Telegram",
    Logo: () => (
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-300/30 bg-sky-400/15 p-3">
        <img src="https://cdn.simpleicons.org/telegram/26A5E4" alt="" className="h-full w-full object-contain" />
      </div>
    ),
  },
  {
    key: "messenger",
    name: "Messenger",
    Logo: () => (
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-blue-300/30 bg-gradient-to-br from-blue-500/25 to-fuchsia-500/20 p-3">
        <img src="https://cdn.simpleicons.org/messenger/00B2FF" alt="" className="h-full w-full object-contain" />
      </div>
    ),
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    Logo: () => (
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 p-3">
        <img src="https://cdn.simpleicons.org/whatsapp/25D366" alt="" className="h-full w-full object-contain" />
      </div>
    ),
  },
];

const marks = {
  yes: {
    label: { pl: "Tak", de: "Ja", en: "Yes" },
    className: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
    Icon: Check,
  },
  partial: {
    label: { pl: "Częściowo", de: "Teilweise", en: "Partial" },
    className: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    Icon: Minus,
  },
  no: {
    label: { pl: "Nie", de: "Nein", en: "No" },
    className: "border-zinc-500/25 bg-zinc-500/10 text-zinc-400",
    Icon: X,
  },
};

function Mark({ value, lang, compact = false }) {
  const item = marks[value] || marks.partial;
  const Icon = item.Icon;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border ${item.className} ${compact ? "px-2.5 py-1" : "px-3 py-1.5"}`}>
      <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {!compact && <span className="text-xs font-bold">{item.label[lang] || item.label.en}</span>}
    </span>
  );
}

export default function Comparison() {
  const { lang } = useLang();
  const copy = lang === "pl"
    ? {
        eyebrow: "Porównanie",
        title: "Ghostel kontra wielkie komunikatory",
        subtitle: "Ghostel stawia na prywatną rozmowę, realne połączenia na Androidzie i kontrolę konta bez społecznościowego hałasu. Duże aplikacje są mocne skalą, ale często dokładamy do nich reklamy, kanały, algorytmy i kompromisy.",
        columns: ["Funkcja", "Ghostel", "Telegram", "Messenger", "WhatsApp"],
        rows: [
          ["Szyfrowanie treści wiadomości end-to-end w rozmowach", "yes", "partial", "partial", "yes"],
          ["Szyfrowane załączniki i zdjęcia jednorazowe 5 s", "yes", "partial", "partial", "partial"],
          ["Pełnoekranowe alerty połączeń na Androidzie", "yes", "partial", "partial", "partial"],
          ["Eksport danych i usunięcie konta z aplikacji", "yes", "partial", "partial", "partial"],
          ["Brak publicznych kanałów, reklam i społecznościowego szumu", "yes", "partial", "no", "partial"],
          ["Szybkie wdrażanie własnych funkcji pod użytkowników", "yes", "no", "no", "no"],
        ],
        highlights: [
          ["Prywatność jako domyślne założenie", "Ghostel nie jest siecią społecznościową. Skupia się na rozmowie, kontakcie i kontroli danych użytkownika.", ShieldCheck],
          ["Android first", "Połączenia, push i ekran odbierania są dopracowywane pod realne testy na telefonach z Androidem.", Smartphone],
        ],
        verdict: "Najlepszy wybór, gdy ważne są rozmowy, prywatność i szybki rozwój funkcji bez zbędnych dodatków.",
        note: "Porównanie opisuje kierunek produktu i aktualne funkcje Ghostel. Telegram, Messenger i WhatsApp są znakami towarowymi swoich właścicieli.",
      }
    : lang === "de"
    ? {
        eyebrow: "Vergleich",
        title: "Ghostel gegen große Messenger",
        subtitle: "Ghostel setzt auf private Gespräche, echte Android-Anrufe und Kontokontrolle ohne Social-Media-Ablenkung. Große Apps sind stark durch Reichweite, bringen aber oft Werbung, Kanäle, Algorithmen und Kompromisse mit.",
        columns: ["Funktion", "Ghostel", "Telegram", "Messenger", "WhatsApp"],
        rows: [
          ["Ende-zu-Ende-Verschlüsselung von Nachrichteninhalten", "yes", "partial", "partial", "yes"],
          ["Verschlüsselte Anhänge und 5-Sekunden-Einmalfotos", "yes", "partial", "partial", "partial"],
          ["Vollbild-Anrufhinweise auf Android", "yes", "partial", "partial", "partial"],
          ["Datenexport und Kontolöschung in der App", "yes", "partial", "partial", "partial"],
          ["Keine öffentlichen Kanäle, Werbung oder Social-Media-Ablenkung", "yes", "partial", "no", "partial"],
          ["Schnelle Produktanpassung für eigene Funktionen", "yes", "no", "no", "no"],
        ],
        highlights: [
          ["Datenschutz als Grundprinzip", "Ghostel ist kein soziales Netzwerk. Der Fokus liegt auf Gesprächen, Kontakten und Kontrolle über eigene Daten.", ShieldCheck],
          ["Android first", "Anrufe, Push und der Annahmebildschirm werden anhand realer Android-Tests optimiert.", Smartphone],
        ],
        verdict: "Die bessere Wahl, wenn Gespräche, Datenschutz und schnelle Produktentwicklung wichtiger sind als unnötige Extras.",
        note: "Der Vergleich beschreibt die Produktausrichtung und aktuelle Ghostel-Funktionen. Telegram, Messenger und WhatsApp sind Marken ihrer jeweiligen Eigentümer.",
      }
    : {
        eyebrow: "Comparison",
        title: "Ghostel vs the big messengers",
        subtitle: "Ghostel focuses on private conversations, real Android calls and account control without social-network noise. Large apps are strong at scale, but often add ads, channels, algorithms and compromises.",
        columns: ["Feature", "Ghostel", "Telegram", "Messenger", "WhatsApp"],
        rows: [
          ["End-to-end encryption for message content", "yes", "partial", "partial", "yes"],
          ["Encrypted attachments and 5-second view-once photos", "yes", "partial", "partial", "partial"],
          ["Full-screen Android incoming call alerts", "yes", "partial", "partial", "partial"],
          ["In-app data export and account deletion", "yes", "partial", "partial", "partial"],
          ["No public channels, ads or social-network noise", "yes", "partial", "no", "partial"],
          ["Fast product changes for custom features", "yes", "no", "no", "no"],
        ],
        highlights: [
          ["Privacy as the product baseline", "Ghostel is not a social network. It focuses on conversations, contacts and user data control.", ShieldCheck],
          ["Android first", "Calls, push and the answer screen are tuned through real tests on Android phones.", Smartphone],
        ],
        verdict: "The better fit when conversations, privacy and fast product iteration matter more than unnecessary extras.",
        note: "This comparison describes Ghostel's product direction and current features. Telegram, Messenger and WhatsApp are trademarks of their respective owners.",
      };

  return (
    <section id="comparison" data-testid="comparison-section" className="relative py-24 sm:py-32">
      <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-72 max-w-5xl rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">{copy.eyebrow}</div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{copy.title}</h2>
            <p className="mt-5 text-base leading-relaxed text-zinc-400">{copy.subtitle}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {copy.highlights.map(([title, desc, Icon], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="surface rounded-2xl p-5"
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950/70 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="grid border-b border-white/10 bg-white/[0.025] p-4 md:grid-cols-4">
            {brands.map(({ key, name, Logo }, index) => (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-2xl p-3 ${key === "ghostel" ? "border border-cyan-300/25 bg-cyan-300/10" : ""}`}
              >
                <Logo />
                <div>
                  <div className={`text-sm font-black ${key === "ghostel" ? "text-cyan-100" : "text-white"}`}>{name}</div>
                  <div className="text-xs text-zinc-500">{copy.columns[index + 1]}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {copy.columns.map((column, index) => (
                    <th
                      key={column}
                      className={`px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] ${index === 1 ? "bg-cyan-300/[0.07] text-cyan-200" : "text-zinc-500"}`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.rows.map((row, index) => (
                  <motion.tr
                    key={row[0]}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b border-white/[0.06] last:border-0"
                  >
                    <td className="px-5 py-5 text-sm font-semibold text-zinc-200">{row[0]}</td>
                    {row.slice(1).map((value, cellIndex) => (
                      <td
                        key={`${row[0]}-${cellIndex}`}
                        className={`px-5 py-5 ${cellIndex === 0 ? "bg-cyan-300/[0.055]" : ""}`}
                      >
                        <Mark value={value} lang={lang} />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 border-t border-white/10 bg-gradient-to-r from-cyan-300/[0.08] via-white/[0.02] to-transparent p-5 md:grid-cols-[1fr_auto] md:items-center">
            <p className="text-sm font-semibold leading-relaxed text-cyan-50">{copy.verdict}</p>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
              {["yes", "partial", "no"].map((value) => (
                <span key={value} className="inline-flex items-center gap-2">
                  <Mark value={value} lang={lang} compact />
                  {marks[value].label[lang] || marks[value].label.en}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-zinc-500">{copy.note}</p>
      </div>
    </section>
  );
}
