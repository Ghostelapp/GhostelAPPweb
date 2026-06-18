import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";
import BrandMark from "@/components/BrandMark";

const sections = {
  pl: {
    title: "Polityka prywatnosci",
    intro:
      "Ta strona opisuje podstawowe zasady przetwarzania danych w aplikacji i serwisie ghostel.app.",
    dataTitle: "Jakie dane przetwarzamy",
    data:
      "ghostel.app moze przetwarzac dane konta, takie jak adres e-mail, nazwa uzytkownika, nazwa wyswietlana, avatar, status, kontakty, zaproszenia, ustawienia profilu, tokeny push oraz metadane rozmow i polaczen.",
    purposeTitle: "Cel przetwarzania",
    purpose:
      "Dane sa wykorzystywane do dzialania konta, logowania, kontaktow, wiadomosci, polaczen glosowych, powiadomien push, ustawien bezpieczenstwa, eksportu danych i obslugi uslugi.",
    analyticsTitle: "Statystyki strony",
    analytics:
      "Strona moze zbierac techniczne statystyki, takie jak odslony, odwiedzane podstrony, przyblizony kraj, typ urzadzenia, przegladarka, zrodlo wejscia i czas aktywnosci. Nie zapisujemy pelnego adresu IP.",
    consent:
      "Statystyki strony sa wysylane dopiero po akceptacji komunikatu prywatnosci. Wybor jest zapisywany lokalnie w przegladarce i moze zostac usuniety przez wyczyszczenie danych strony.",
    permissionsTitle: "Uprawnienia aplikacji",
    permissions: [
      "Mikrofon: rozmowy glosowe i wiadomosci audio.",
      "Aparat i zdjecia: avatar oraz obrazy w rozmowach.",
      "Powiadomienia: wiadomosci i polaczenia przychodzace.",
      "Full-screen intent: ekran polaczenia przychodzacego.",
    ],
    deleteTitle: "Eksport i usuwanie danych",
    delete:
      "W profilu aplikacji uzytkownik moze pobrac swoje dane oraz trwale usunac konto. Usuniecie konta usuwa profil, kontakty, zaproszenia, tokeny push i dane prywatne, a wiadomosci wyslane do innych osob moga zostac zanonimizowane.",
    contactTitle: "Kontakt",
    contact:
      "W sprawach prywatnosci, bezpieczenstwa i danych konta skontaktuj sie przez formularz supportu albo napisz na support@ghostel.app.",
  },
  en: {
    title: "Privacy policy",
    intro:
      "This page describes the basic data processing rules for the ghostel.app app and website.",
    dataTitle: "Data we process",
    data:
      "ghostel.app may process account data such as email address, username, display name, avatar, status, contacts, invitations, profile settings, push tokens and message or call metadata.",
    purposeTitle: "Purpose of processing",
    purpose:
      "Data is used to operate accounts, sign-in, contacts, messages, voice calls, push notifications, security settings, data export and service maintenance.",
    analyticsTitle: "Website analytics",
    analytics:
      "The website may collect technical statistics such as page views, visited pages, approximate country, device type, browser, traffic source and activity duration. Full IP addresses are not stored.",
    consent:
      "Website analytics are sent only after accepting the privacy notice. The choice is stored locally in the browser and can be removed by clearing site data.",
    permissionsTitle: "App permissions",
    permissions: [
      "Microphone: voice calls and audio messages.",
      "Camera and photos: avatar and images in conversations.",
      "Notifications: messages and incoming calls.",
      "Full-screen intent: incoming call screen.",
    ],
    deleteTitle: "Data export and deletion",
    delete:
      "The app profile lets users export their data and permanently delete the account. Account deletion removes profile, contacts, invitations, push tokens and private data, while messages sent to other users may be anonymized.",
    contactTitle: "Contact",
    contact:
      "For privacy, security and account data matters, contact support through the form or email support@ghostel.app.",
  },
  de: {
    title: "Datenschutzerklaerung",
    intro:
      "Diese Seite beschreibt die grundlegenden Regeln der Datenverarbeitung in der ghostel.app App und Website.",
    dataTitle: "Verarbeitete Daten",
    data:
      "ghostel.app kann Kontodaten wie E-Mail-Adresse, Benutzername, Anzeigename, Avatar, Status, Kontakte, Einladungen, Profileinstellungen, Push-Tokens sowie Nachrichten- und Anrufmetadaten verarbeiten.",
    purposeTitle: "Zweck der Verarbeitung",
    purpose:
      "Daten werden fuer Konten, Anmeldung, Kontakte, Nachrichten, Sprachanrufe, Push-Benachrichtigungen, Sicherheitseinstellungen, Datenexport und Betrieb des Dienstes verwendet.",
    analyticsTitle: "Website-Statistiken",
    analytics:
      "Die Website kann technische Statistiken wie Seitenaufrufe, besuchte Seiten, ungefaehres Land, Geraetetyp, Browser, Zugriffsquelle und Aktivitaetsdauer erfassen. Vollstaendige IP-Adressen werden nicht gespeichert.",
    consent:
      "Website-Statistiken werden erst nach Zustimmung im Datenschutzhinweis gesendet. Die Auswahl wird lokal im Browser gespeichert und kann durch Loeschen der Website-Daten entfernt werden.",
    permissionsTitle: "App-Berechtigungen",
    permissions: [
      "Mikrofon: Sprachanrufe und Audionachrichten.",
      "Kamera und Fotos: Avatar und Bilder in Unterhaltungen.",
      "Benachrichtigungen: Nachrichten und eingehende Anrufe.",
      "Vollbildanzeige: Bildschirm fuer eingehende Anrufe.",
    ],
    deleteTitle: "Datenexport und Loeschung",
    delete:
      "Im App-Profil koennen Benutzer ihre Daten exportieren und das Konto dauerhaft loeschen. Dabei werden Profil, Kontakte, Einladungen, Push-Tokens und private Daten entfernt.",
    contactTitle: "Kontakt",
    contact:
      "Bei Fragen zu Datenschutz, Sicherheit und Kontodaten kontaktiere den Support ueber das Formular oder schreibe an support@ghostel.app.",
  },
};

function PolicySection({ title, children }) {
  return (
    <section className="surface rounded-2xl p-7">
      <h2 className="font-display text-xl font-bold text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function Privacy() {
  const { lang } = useLang();
  const text = sections[lang] || sections.en;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
          <BrandMark className="text-xs" />
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          {text.title}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">{text.intro}</p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <PolicySection title={text.dataTitle}>
            <p>{text.data}</p>
          </PolicySection>

          <PolicySection title={text.purposeTitle}>
            <p>{text.purpose}</p>
          </PolicySection>

          <PolicySection title={text.analyticsTitle}>
            <p>{text.analytics}</p>
            <p className="mt-3">{text.consent}</p>
          </PolicySection>

          <PolicySection title={text.permissionsTitle}>
            <ul className="list-disc pl-5 space-y-2">
              {text.permissions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PolicySection>

          <PolicySection title={text.deleteTitle}>
            <p>{text.delete}</p>
          </PolicySection>

          <PolicySection title={text.contactTitle}>
            <p>{text.contact}</p>
          </PolicySection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
