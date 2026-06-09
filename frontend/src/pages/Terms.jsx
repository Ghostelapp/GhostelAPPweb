import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";
import BrandMark from "@/components/BrandMark";

export default function Terms() {
  const { lang } = useLang();
  const isPl = lang === "pl";
  const isDe = lang === "de";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
          <BrandMark className="text-xs" />
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          {isPl ? "Regulamin" : isDe ? "Nutzungsbedingungen" : "Terms of service"}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">
          {isPl
            ? "To robocza wersja regulaminu. Przed publikacją uzupełnij ją o dane operatora, kraj świadczenia usługi, pełne zasady odpowiedzialności i wymagane informacje prawne."
            : isDe ? "Dies ist ein Entwurf der Nutzungsbedingungen. Ergänze ihn vor der Veröffentlichung um Betreiberangaben und erforderliche rechtliche Informationen." : "This is a draft terms page. Before publication, complete it with operator details, service jurisdiction, liability rules and required legal information."}
        </p>

        <div className="space-y-6">
          {[
            {
              title: isPl ? "Korzystanie z aplikacji" : isDe ? "Nutzung der App" : "Use of the app",
              body: isPl
                ? "Użytkownik odpowiada za swoje konto, hasło oraz treści wysyłane przez aplikację. Zabronione jest używanie aplikacji do działań niezgodnych z prawem."
                : isDe ? "Benutzer sind für ihr Konto, Passwort und die gesendeten Inhalte verantwortlich. Die App darf nicht für rechtswidrige Aktivitäten genutzt werden." : "Users are responsible for their account, password and content sent through the app. The app must not be used for unlawful activity.",
            },
            {
              title: isPl ? "Konto użytkownika" : isDe ? "Benutzerkonto" : "User account",
              body: isPl
                ? "Do korzystania z funkcji komunikatora wymagane jest konto. Użytkownik może eksportować dane oraz usunąć konto w aplikacji."
                : isDe ? "Die Messenger-Funktionen erfordern ein Konto. Benutzer können Daten exportieren und ihr Konto in der App löschen." : "Messenger features require an account. Users can export data and delete their account in the app.",
            },
            {
              title: isPl ? "Dostępność usługi" : isDe ? "Verfügbarkeit des Dienstes" : "Service availability",
              body: isPl
                ? "Usługa może być czasowo niedostępna podczas konserwacji, aktualizacji lub awarii infrastruktury."
                : isDe ? "Der Dienst kann während Wartungsarbeiten, Aktualisierungen oder Infrastrukturstörungen vorübergehend nicht verfügbar sein." : "The service may be temporarily unavailable during maintenance, updates or infrastructure incidents.",
            },
            {
              title: isPl ? "Kontakt" : isDe ? "Kontakt" : "Contact",
              body: isPl
                ? "Przed publikacją wpisz tutaj oficjalny adres e-mail operatora aplikacji ghostel.app."
                : isDe ? "Füge hier vor der Veröffentlichung die offizielle Kontaktadresse des ghostel.app-Betreibers ein." : "Before publication, add the official contact email for the ghostel.app app operator here.",
            },
          ].map((section) => (
            <section key={section.title} className="surface rounded-2xl p-7">
              <h2 className="font-display text-xl font-bold text-white mb-3">{section.title}</h2>
              <p className="text-zinc-300 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
