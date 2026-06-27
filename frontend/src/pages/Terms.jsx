import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";
import BrandMark from "@/components/BrandMark";

const termsCopy = {
  de: {
    title: "Nutzungsbedingungen",
    intro:
      "Diese Nutzungsbedingungen beschreiben die grundlegenden Regeln fuer die Nutzung von ghostel.app, der Website, der mobilen App und des Administrationsbereichs.",
    sections: [
      {
        title: "Nutzung der App",
        body: "Benutzer sind für ihr Konto, Passwort und die über die App gesendeten Inhalte verantwortlich. Die App darf nicht für rechtswidrige Aktivitäten genutzt werden.",
      },
      {
        title: "Benutzerkonto",
        body: "Die Messenger-Funktionen erfordern ein Konto. Benutzer können Daten exportieren und ihr Konto in der App löschen.",
      },
      {
        title: "Verfügbarkeit des Dienstes",
        body: "Der Dienst kann während Wartungsarbeiten, Aktualisierungen oder Infrastrukturstörungen vorübergehend nicht verfügbar sein.",
      },
      {
        title: "Anrufe und Benachrichtigungen",
        body: "ghostel.app-Anrufe funktionieren über Internetverbindung, Push-Benachrichtigungen und Geräteeinstellungen. Die App ersetzt keinen Telefondienst und darf nicht für Notrufe verwendet werden.",
      },
      {
        title: "Testerprogramm und Belohnungen",
        body: "Tester-Belohnungen können für bestätigte, nützliche Fehlerberichte vergeben werden. Duplikate, missbräuchliche Meldungen und Berichte ohne nachvollziehbare Schritte zählen nicht.",
      },
      {
        title: "Kontakt",
        body: "Kontakt fuer Support-, Konto-, Datenschutz- und Sicherheitsfragen: support@ghostel.app.",
      },
    ],
  },
  en: {
    title: "Terms of service",
    intro:
      "These terms describe the basic rules for using ghostel.app, including the website, mobile app, tester program and admin-managed support features.",
    sections: [
      {
        title: "Use of the app",
        body: "Users are responsible for their account, password and content sent through the app. The app must not be used for unlawful activity.",
      },
      {
        title: "User account",
        body: "Messenger features require an account. Users can export data and delete their account in the app.",
      },
      {
        title: "Service availability",
        body: "The service may be temporarily unavailable during maintenance, updates or infrastructure incidents.",
      },
      {
        title: "Calls and notifications",
        body: "ghostel.app calls depend on internet connectivity, push notifications and device settings. The app is not a telephone carrier and must not be used for emergency calls.",
      },
      {
        title: "Tester program and rewards",
        body: "Tester rewards may be granted for verified, useful bug reports. Duplicate, abusive or non-reproducible reports do not count.",
      },
      {
        title: "Contact",
        body: "For support, account, privacy and security matters, contact support@ghostel.app.",
      },
    ],
  },
  es: {
    title: "Términos del servicio",
    intro:
      "Estos términos describen las reglas básicas de uso de ghostel.app, incluidos el sitio web, la aplicación móvil, el programa de pruebas y el soporte gestionado por el panel.",
    sections: [
      {
        title: "Uso de la aplicación",
        body: "Los usuarios son responsables de su cuenta, contraseña y del contenido enviado a través de la aplicación. La aplicación no puede utilizarse para actividades ilegales.",
      },
      {
        title: "Cuenta de usuario",
        body: "Las funciones de mensajería requieren una cuenta. Los usuarios pueden exportar sus datos y eliminar la cuenta desde la aplicación.",
      },
      {
        title: "Disponibilidad del servicio",
        body: "El servicio puede no estar disponible temporalmente durante tareas de mantenimiento, actualizaciones o incidencias de infraestructura.",
      },
      {
        title: "Llamadas y notificaciones",
        body: "Las llamadas de ghostel.app dependen de la conexión a internet, las notificaciones push y los ajustes del dispositivo. La app no sustituye a un operador telefónico y no debe usarse para llamadas de emergencia.",
      },
      {
        title: "Programa de testers y recompensas",
        body: "Las recompensas para testers pueden concederse por reportes de errores verificados y útiles. Los duplicados, reportes abusivos o no reproducibles no cuentan.",
      },
      {
        title: "Contacto",
        body: "Para soporte, cuenta, privacidad y seguridad, contacta con support@ghostel.app.",
      },
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    intro:
      "Ces conditions décrivent les règles de base d'utilisation de ghostel.app, y compris le site web, l'application mobile, le programme de test et le support géré depuis le panneau d'administration.",
    sections: [
      {
        title: "Utilisation de l'application",
        body: "Les utilisateurs sont responsables de leur compte, de leur mot de passe et du contenu envoyé via l'application. L'application ne doit pas être utilisée pour des activités illégales.",
      },
      {
        title: "Compte utilisateur",
        body: "Les fonctions de messagerie nécessitent un compte. Les utilisateurs peuvent exporter leurs données et supprimer leur compte dans l'application.",
      },
      {
        title: "Disponibilité du service",
        body: "Le service peut être temporairement indisponible pendant la maintenance, les mises à jour ou des incidents d'infrastructure.",
      },
      {
        title: "Appels et notifications",
        body: "Les appels ghostel.app dépendent de la connexion internet, des notifications push et des réglages de l'appareil. L'application ne remplace pas un opérateur téléphonique et ne doit pas être utilisée pour les appels d'urgence.",
      },
      {
        title: "Programme de test et récompenses",
        body: "Les récompenses des testeurs peuvent être attribuées pour des rapports de bugs vérifiés et utiles. Les doublons, rapports abusifs ou non reproductibles ne comptent pas.",
      },
      {
        title: "Contact",
        body: "Pour le support, le compte, la confidentialité et la sécurité, contactez support@ghostel.app.",
      },
    ],
  },
  pl: {
    title: "Regulamin",
    intro:
      "Ten regulamin opisuje podstawowe zasady korzystania z ghostel.app, w tym strony internetowej, aplikacji mobilnej, programu testów i obsługi zgłoszeń przez panel administracyjny.",
    sections: [
      {
        title: "Korzystanie z aplikacji",
        body: "Użytkownik odpowiada za swoje konto, hasło oraz treści wysyłane przez aplikację. Zabronione jest używanie aplikacji do działań niezgodnych z prawem.",
      },
      {
        title: "Konto użytkownika",
        body: "Do korzystania z funkcji komunikatora wymagane jest konto. Użytkownik może eksportować dane oraz usunąć konto w aplikacji.",
      },
      {
        title: "Dostępność usługi",
        body: "Usługa może być czasowo niedostępna podczas konserwacji, aktualizacji lub awarii infrastruktury.",
      },
      {
        title: "Połączenia i powiadomienia",
        body: "Połączenia ghostel.app zależą od internetu, powiadomień push i ustawień urządzenia. Aplikacja nie zastępuje operatora telefonicznego i nie służy do połączeń alarmowych.",
      },
      {
        title: "Program testów i nagrody",
        body: "Nagrody dla testerów mogą być przyznawane za potwierdzone i wartościowe zgłoszenia błędów. Duplikaty, zgłoszenia nadużyciowe lub bez możliwych do odtworzenia kroków nie są liczone.",
      },
      {
        title: "Kontakt",
        body: "W sprawach wsparcia, konta, prywatności i bezpieczeństwa skontaktuj się przez support@ghostel.app.",
      },
    ],
  },
};

export default function Terms() {
  const { lang } = useLang();
  const copy = termsCopy[lang] || termsCopy.en;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
          <BrandMark className="text-xs" />
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          {copy.title}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">{copy.intro}</p>

        <div className="space-y-6">
          {copy.sections.map((section) => (
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
