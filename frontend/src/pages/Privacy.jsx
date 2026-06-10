import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";
import BrandMark from "@/components/BrandMark";

export default function Privacy() {
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
          {isPl ? "Polityka prywatności" : isDe ? "Datenschutzerklärung" : "Privacy policy"}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">
          {isPl
            ? "Ta strona opisuje podstawowe zasady przetwarzania danych w aplikacji ghostel.app. Przed publikacją uzupełnij ją o oficjalne dane operatora, adres kontaktowy i docelową domenę usługi."
            : isDe ? "Diese Seite beschreibt die grundlegenden Regeln der Datenverarbeitung in ghostel.app. Ergänze sie vor der Veröffentlichung um offizielle Betreiber- und Kontaktangaben." : "This page describes the basic data processing rules for the ghostel.app app. Before publication, complete it with the official operator details, contact address and production service domain."}
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Jakie dane przetwarzamy" : isDe ? "Verarbeitete Daten" : "Data we process"}
            </h2>
            <p>
              {isPl
                ? "ghostel.app może przetwarzać dane konta, takie jak adres e-mail, nazwa użytkownika, nazwa wyświetlana, avatar, status, kontakty, zaproszenia, ustawienia profilu, tokeny push oraz metadane rozmów i połączeń."
                : isDe ? "ghostel.app kann Kontodaten wie E-Mail-Adresse, Benutzername, Anzeigename, Avatar, Status, Kontakte, Einladungen, Profileinstellungen, Push-Tokens sowie Nachrichten- und Anrufmetadaten verarbeiten." : "ghostel.app may process account data such as email address, username, display name, avatar, status, contacts, invitations, profile settings, push tokens and message or call metadata."}
            </p>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Cel przetwarzania" : isDe ? "Zweck der Verarbeitung" : "Purpose of processing"}
            </h2>
            <p>
              {isPl
                ? "Dane są wykorzystywane do działania konta, logowania, kontaktów, wiadomości, połączeń głosowych, powiadomień push, ustawień bezpieczeństwa, eksportu danych i obsługi usługi."
                : isDe ? "Daten werden für Konten, Anmeldung, Kontakte, Nachrichten, Sprachanrufe, Push-Benachrichtigungen, Sicherheitseinstellungen, Datenexport und Betrieb des Dienstes verwendet." : "Data is used to operate accounts, sign-in, contacts, messages, voice calls, push notifications, security settings, data export and service maintenance."}
            </p>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Anonimowe statystyki strony" : isDe ? "Anonyme Website-Statistiken" : "Anonymous website analytics"}
            </h2>
            <p>
              {isPl
                ? "Strona zbiera anonimowe statystyki techniczne, takie jak odsłony, odwiedzane podstrony, przybliżony kraj, typ urządzenia, przeglądarka, źródło wejścia i czas aktywności. Statystyki nie zapisują pełnego adresu IP."
                : isDe
                ? "Die Website erfasst anonyme technische Statistiken wie Seitenaufrufe, besuchte Seiten, ungefähres Land, Gerätetyp, Browser, Zugriffsquelle und Aktivitätsdauer. Vollständige IP-Adressen werden nicht gespeichert."
                : "The website collects anonymous technical statistics such as page views, visited pages, approximate country, device type, browser, traffic source and activity duration. Full IP addresses are not stored."}
            </p>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Uprawnienia aplikacji" : isDe ? "App-Berechtigungen" : "App permissions"}
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>{isPl ? "Mikrofon: rozmowy głosowe i wiadomości audio." : isDe ? "Mikrofon: Sprachanrufe und Audionachrichten." : "Microphone: voice calls and audio messages."}</li>
              <li>{isPl ? "Aparat i zdjęcia: avatar oraz obrazy w rozmowach." : isDe ? "Kamera und Fotos: Avatar und Bilder in Unterhaltungen." : "Camera and photos: avatar and images in conversations."}</li>
              <li>{isPl ? "Powiadomienia: wiadomości i połączenia przychodzące." : isDe ? "Benachrichtigungen: Nachrichten und eingehende Anrufe." : "Notifications: messages and incoming calls."}</li>
              <li>{isPl ? "Full-screen intent: ekran połączenia przychodzącego." : isDe ? "Vollbildanzeige: Bildschirm für eingehende Anrufe." : "Full-screen intent: incoming call screen."}</li>
            </ul>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Eksport i usuwanie danych" : isDe ? "Datenexport und Löschung" : "Data export and deletion"}
            </h2>
            <p>
              {isPl
                ? "W profilu aplikacji użytkownik może pobrać swoje dane oraz trwale usunąć konto. Usunięcie konta usuwa profil, kontakty, zaproszenia, tokeny push i dane prywatne, a wiadomości wysłane do innych osób mogą zostać zanonimizowane."
                : isDe ? "Im App-Profil können Benutzer ihre Daten exportieren und das Konto dauerhaft löschen. Dabei werden Profil, Kontakte, Einladungen, Push-Tokens und private Daten entfernt." : "The app profile lets users export their data and permanently delete the account. Account deletion removes profile, contacts, invitations, push tokens and private data, while messages sent to other users may be anonymized."}
            </p>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Kontakt" : isDe ? "Kontakt" : "Contact"}
            </h2>
            <p>
              {isPl
                ? "Przed publikacją wpisz tutaj oficjalny adres e-mail operatora aplikacji ghostel.app."
                : isDe ? "Füge hier vor der Veröffentlichung die offizielle Kontaktadresse des ghostel.app-Betreibers ein." : "Before publication, add the official contact email for the ghostel.app app operator here."}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
