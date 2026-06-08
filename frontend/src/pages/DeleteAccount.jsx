import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";

export default function DeleteAccount() {
  const { lang } = useLang();
  const isPl = lang === "pl";
  const isDe = lang === "de";

  const steps = isPl
    ? [
        "Otwórz aplikację Ghostel i zaloguj się na konto.",
        "Przejdź do zakładki Profil.",
        "W sekcji Prywatność wybierz Usuń konto.",
        "Potwierdź operację przyciskiem Usuń trwale.",
        "Po zakończeniu aplikacja wyloguje Cię automatycznie.",
      ]
    : isDe ? [
        "Öffne die Ghostel-App und melde dich an.",
        "Wechsle zum Tab Profil.",
        "Wähle im Bereich Datenschutz die Option Konto löschen.",
        "Bestätige mit Dauerhaft löschen.",
        "Nach Abschluss wirst du automatisch abgemeldet.",
      ] : [
        "Open the Ghostel app and sign in.",
        "Go to the Profile tab.",
        "In the Privacy section, choose Delete account.",
        "Confirm with Delete permanently.",
        "The app signs you out after the operation is complete.",
      ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
          {isPl ? "Konto Ghostel" : isDe ? "Ghostel-Konto" : "Ghostel account"}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          {isPl ? "Usuwanie konta i danych" : isDe ? "Konto und Daten löschen" : "Account and data deletion"}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">
          {isPl
            ? "Konto Ghostel można usunąć bezpośrednio w aplikacji. Operacja jest trwała i wymaga zalogowania na konto, które ma zostać usunięte."
            : isDe ? "Ein Ghostel-Konto kann direkt in der App gelöscht werden. Der Vorgang ist dauerhaft und erfordert die Anmeldung beim zu löschenden Konto." : "A Ghostel account can be deleted directly in the app. The operation is permanent and requires signing in to the account that should be deleted."}
        </p>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-5">
              {isPl ? "Jak usunąć konto" : isDe ? "Konto löschen" : "How to delete your account"}
            </h2>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-4 text-zinc-300">
                  <span className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 grid place-items-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-5">
              {isPl ? "Co zostanie usunięte" : isDe ? "Was gelöscht wird" : "What gets deleted"}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li>{isPl ? "Profil, e-mail, nazwa, avatar i ustawienia konta." : isDe ? "Profil, E-Mail, Name, Avatar und Kontoeinstellungen." : "Profile, email, name, avatar and account settings."}</li>
              <li>{isPl ? "Tokeny push i dane urządzeń." : isDe ? "Push-Tokens und Gerätedaten." : "Push tokens and device data."}</li>
              <li>{isPl ? "Kontakty, zaproszenia i blokady." : isDe ? "Kontakte, Einladungen und Blockierungen." : "Contacts, invitations and blocks."}</li>
              <li>{isPl ? "Prywatne załączniki i historia połączeń." : isDe ? "Private Anhänge und Anrufverlauf." : "Private attachments and call history."}</li>
            </ul>
          </section>
        </div>

        <section className="surface rounded-2xl p-7 mt-6">
          <h2 className="font-display text-xl font-bold text-white mb-3">
            {isPl ? "Co może zostać zachowane" : isDe ? "Was erhalten bleiben kann" : "What may remain"}
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            {isPl
              ? "Wiadomości wysłane do innych osób mogą pozostać w rozmowach odbiorców, ale zostaną zanonimizowane i oznaczone jako treści po usuniętym koncie."
              : isDe ? "Nachrichten an andere Personen können in deren Unterhaltungen verbleiben, werden jedoch anonymisiert und als Inhalt eines gelöschten Kontos gekennzeichnet." : "Messages sent to other people may remain in recipients' conversations, but they are anonymized and marked as content from a deleted account."}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
