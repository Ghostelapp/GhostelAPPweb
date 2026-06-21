import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";
import BrandMark from "@/components/BrandMark";

const termsCopy = {
  de: {
    title: "Nutzungsbedingungen",
    intro:
      "Dies ist ein Entwurf der Nutzungsbedingungen. Ergänze ihn vor der Veröffentlichung um Betreiberangaben, das Land der Dienstleistungserbringung, Haftungsregeln und alle erforderlichen rechtlichen Informationen.",
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
        title: "Kontakt",
        body: "Füge hier vor der Veröffentlichung die offizielle Kontaktadresse des ghostel.app-Betreibers ein.",
      },
    ],
  },
  en: {
    title: "Terms of service",
    intro:
      "This is a draft terms page. Before publication, complete it with operator details, service jurisdiction, liability rules and required legal information.",
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
        title: "Contact",
        body: "Before publication, add the official contact email for the ghostel.app app operator here.",
      },
    ],
  },
  es: {
    title: "Términos del servicio",
    intro:
      "Esta es una versión preliminar de los términos del servicio. Antes de publicarla, complétala con los datos del operador, la jurisdicción del servicio, las reglas de responsabilidad y la información legal obligatoria.",
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
        title: "Contacto",
        body: "Antes de publicar esta página, añade aquí el correo oficial del operador de ghostel.app.",
      },
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    intro:
      "Cette page est une version provisoire des conditions d'utilisation. Avant sa publication, complète-la avec les informations de l'opérateur, la juridiction du service, les règles de responsabilité et toutes les mentions légales obligatoires.",
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
        title: "Contact",
        body: "Avant la publication, ajoute ici l'adresse e-mail officielle de l'opérateur de ghostel.app.",
      },
    ],
  },
  pl: {
    title: "Regulamin",
    intro:
      "To robocza wersja regulaminu. Przed publikacją uzupełnij ją o dane operatora, kraj świadczenia usługi, pełne zasady odpowiedzialności i wymagane informacje prawne.",
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
        title: "Kontakt",
        body: "Przed publikacją wpisz tutaj oficjalny adres e-mail operatora aplikacji ghostel.app.",
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
