import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";
import BrandMark from "@/components/BrandMark";

const sections = {
  pl: {
    title: "Polityka prywatności",
    intro:
      "Ta strona opisuje podstawowe zasady przetwarzania danych w aplikacji i serwisie ghostel.app.",
    dataTitle: "Jakie dane przetwarzamy",
    data:
      "ghostel.app może przetwarzać dane konta, takie jak adres e-mail, nazwa użytkownika, nazwa wyświetlana, awatar, status, kontakty, zaproszenia, ustawienia profilu, tokeny push oraz metadane rozmów i połączeń.",
    purposeTitle: "Cel przetwarzania",
    purpose:
      "Dane są wykorzystywane do działania konta, logowania, kontaktów, wiadomości, połączeń głosowych, powiadomień push, ustawień bezpieczeństwa, eksportu danych i obsługi usługi.",
    analyticsTitle: "Statystyki strony",
    analytics:
      "Strona może zbierać techniczne statystyki, takie jak odsłony, odwiedzane podstrony, przybliżony kraj, typ urządzenia, przeglądarka, źródło wejścia i czas aktywności. Nie zapisujemy pełnego adresu IP.",
    consent:
      "Statystyki strony są wysyłane dopiero po akceptacji komunikatu prywatności. Wybór jest zapisywany lokalnie w przeglądarce i może zostać usunięty przez wyczyszczenie danych strony.",
    permissionsTitle: "Uprawnienia aplikacji",
    permissions: [
      "Mikrofon: rozmowy głosowe i wiadomości audio.",
      "Aparat i zdjęcia: awatar oraz obrazy w rozmowach.",
      "Powiadomienia: wiadomości i połączenia przychodzące.",
      "Tryb pełnoekranowy: ekran połączenia przychodzącego.",
    ],
    deleteTitle: "Eksport i usuwanie danych",
    delete:
      "W profilu aplikacji użytkownik może pobrać swoje dane oraz trwale usunąć konto. Usunięcie konta usuwa profil, kontakty, zaproszenia, tokeny push i dane prywatne, a wiadomości wysłane do innych osób mogą zostać zanonimizowane.",
    contactTitle: "Kontakt",
    contact:
      "W sprawach prywatności, bezpieczeństwa i danych konta skontaktuj się przez formularz pomocy albo napisz na support@ghostel.app.",
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
  es: {
    title: "Política de privacidad",
    intro: "Esta página describe las reglas básicas de tratamiento de datos de la aplicación y el sitio web ghostel.app.",
    dataTitle: "Datos que tratamos",
    data: "ghostel.app puede tratar datos de la cuenta como la dirección de correo, el nombre de usuario, el nombre visible, el avatar, el estado, los contactos, las invitaciones, los ajustes del perfil, los tokens push y los metadatos de mensajes o llamadas.",
    purposeTitle: "Finalidad del tratamiento",
    purpose: "Los datos se utilizan para gestionar las cuentas, el inicio de sesión, los contactos, los mensajes, las llamadas de voz, las notificaciones push, los ajustes de seguridad, la exportación de datos y el mantenimiento del servicio.",
    analyticsTitle: "Estadísticas del sitio web",
    analytics: "El sitio puede recopilar estadísticas técnicas como visitas, páginas consultadas, país aproximado, tipo de dispositivo, navegador, fuente de tráfico y duración de la actividad. No guardamos direcciones IP completas.",
    consent: "Las estadísticas se envían únicamente después de aceptar el aviso de privacidad. La elección se guarda localmente en el navegador y puede eliminarse borrando los datos del sitio.",
    permissionsTitle: "Permisos de la aplicación",
    permissions: [
      "Micrófono: llamadas de voz y mensajes de audio.",
      "Cámara y fotos: avatar e imágenes en las conversaciones.",
      "Notificaciones: mensajes y llamadas entrantes.",
      "Pantalla completa: pantalla de llamada entrante.",
    ],
    deleteTitle: "Exportación y eliminación de datos",
    delete: "Desde el perfil se pueden exportar los datos y eliminar permanentemente la cuenta. La eliminación borra el perfil, los contactos, las invitaciones, los tokens push y los datos privados; los mensajes enviados a otras personas pueden anonimizarse.",
    contactTitle: "Contacto",
    contact: "Para cuestiones de privacidad, seguridad o datos de la cuenta, usa el formulario de soporte o escribe a support@ghostel.app.",
  },
  fr: {
    title: "Politique de confidentialité",
    intro: "Cette page décrit les règles essentielles de traitement des données de l’application et du site ghostel.app.",
    dataTitle: "Données traitées",
    data: "ghostel.app peut traiter les données du compte, notamment l’adresse e-mail, le nom d’utilisateur, le nom affiché, l’avatar, le statut, les contacts, les invitations, les paramètres du profil, les jetons push et les métadonnées des messages ou des appels.",
    purposeTitle: "Finalité du traitement",
    purpose: "Les données servent au fonctionnement des comptes, à la connexion, aux contacts, aux messages, aux appels vocaux, aux notifications push, aux paramètres de sécurité, à l’export des données et à la maintenance du service.",
    analyticsTitle: "Statistiques du site",
    analytics: "Le site peut recueillir des statistiques techniques telles que les pages vues, les pages consultées, le pays approximatif, le type d’appareil, le navigateur, la source du trafic et la durée d’activité. Nous ne conservons pas les adresses IP complètes.",
    consent: "Les statistiques sont envoyées uniquement après l’acceptation de l’avis de confidentialité. Le choix est enregistré localement dans le navigateur et peut être supprimé en effaçant les données du site.",
    permissionsTitle: "Autorisations de l’application",
    permissions: [
      "Microphone : appels vocaux et messages audio.",
      "Appareil photo et photos : avatar et images dans les conversations.",
      "Notifications : messages et appels entrants.",
      "Plein écran : écran d’appel entrant.",
    ],
    deleteTitle: "Export et suppression des données",
    delete: "Le profil permet d’exporter les données et de supprimer définitivement le compte. La suppression efface le profil, les contacts, les invitations, les jetons push et les données privées ; les messages envoyés à d’autres personnes peuvent être anonymisés.",
    contactTitle: "Contact",
    contact: "Pour toute question concernant la confidentialité, la sécurité ou les données du compte, utilisez le formulaire d’assistance ou écrivez à support@ghostel.app.",
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
