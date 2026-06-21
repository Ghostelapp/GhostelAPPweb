import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";

const deleteAccountCopy = {
  de: {
    eyebrow: "ghostel.app-Konto",
    title: "Konto und Daten löschen",
    intro:
      "Ein ghostel.app-Konto kann direkt in der App gelöscht werden. Der Vorgang ist dauerhaft und erfordert die Anmeldung beim Konto, das gelöscht werden soll.",
    stepsTitle: "Konto löschen",
    steps: [
      "Öffne die ghostel.app-App und melde dich an.",
      "Wechsle zum Tab Profil.",
      "Wähle im Bereich Datenschutz die Option Konto löschen.",
      "Bestätige mit Dauerhaft löschen.",
      "Nach Abschluss wirst du automatisch abgemeldet.",
    ],
    deletedTitle: "Was gelöscht wird",
    deletedItems: [
      "Profil, E-Mail, Name, Avatar und Kontoeinstellungen.",
      "Push-Tokens und Gerätedaten.",
      "Kontakte, Einladungen und Blockierungen.",
      "Private Anhänge und Anrufverlauf.",
    ],
    remainTitle: "Was erhalten bleiben kann",
    remainBody:
      "Nachrichten an andere Personen können in deren Unterhaltungen verbleiben, werden jedoch anonymisiert und als Inhalt eines gelöschten Kontos gekennzeichnet.",
  },
  en: {
    eyebrow: "ghostel.app account",
    title: "Account and data deletion",
    intro:
      "A ghostel.app account can be deleted directly in the app. The operation is permanent and requires signing in to the account that should be deleted.",
    stepsTitle: "How to delete your account",
    steps: [
      "Open the ghostel.app app and sign in.",
      "Go to the Profile tab.",
      "In the Privacy section, choose Delete account.",
      "Confirm with Delete permanently.",
      "The app signs you out after the operation is complete.",
    ],
    deletedTitle: "What gets deleted",
    deletedItems: [
      "Profile, email, name, avatar and account settings.",
      "Push tokens and device data.",
      "Contacts, invitations and blocks.",
      "Private attachments and call history.",
    ],
    remainTitle: "What may remain",
    remainBody:
      "Messages sent to other people may remain in recipients' conversations, but they are anonymized and marked as content from a deleted account.",
  },
  es: {
    eyebrow: "cuenta de ghostel.app",
    title: "Eliminación de la cuenta y los datos",
    intro:
      "Una cuenta de ghostel.app puede eliminarse directamente desde la aplicación. La operación es permanente y requiere iniciar sesión en la cuenta que se va a eliminar.",
    stepsTitle: "Cómo eliminar tu cuenta",
    steps: [
      "Abre la app ghostel.app e inicia sesión.",
      "Ve a la pestaña Perfil.",
      "En la sección Privacidad, elige Eliminar cuenta.",
      "Confirma con Eliminar de forma permanente.",
      "Cuando termine el proceso, la aplicación cerrará tu sesión automáticamente.",
    ],
    deletedTitle: "Qué se elimina",
    deletedItems: [
      "Perfil, correo electrónico, nombre, avatar y ajustes de la cuenta.",
      "Tokens push y datos del dispositivo.",
      "Contactos, invitaciones y bloqueos.",
      "Archivos adjuntos privados e historial de llamadas.",
    ],
    remainTitle: "Qué puede permanecer",
    remainBody:
      "Los mensajes enviados a otras personas pueden permanecer en las conversaciones de los destinatarios, pero se anonimizan y se marcan como contenido de una cuenta eliminada.",
  },
  fr: {
    eyebrow: "compte ghostel.app",
    title: "Suppression du compte et des données",
    intro:
      "Un compte ghostel.app peut être supprimé directement dans l'application. L'opération est définitive et nécessite une connexion au compte à supprimer.",
    stepsTitle: "Comment supprimer votre compte",
    steps: [
      "Ouvrez l'application ghostel.app et connectez-vous.",
      "Accédez à l'onglet Profil.",
      "Dans la section Confidentialité, choisissez Supprimer le compte.",
      "Confirmez avec Supprimer définitivement.",
      "Une fois l'opération terminée, l'application vous déconnecte automatiquement.",
    ],
    deletedTitle: "Ce qui sera supprimé",
    deletedItems: [
      "Profil, e-mail, nom, avatar et paramètres du compte.",
      "Jetons push et données de l'appareil.",
      "Contacts, invitations et blocages.",
      "Pièces jointes privées et historique des appels.",
    ],
    remainTitle: "Ce qui peut rester",
    remainBody:
      "Les messages envoyés à d'autres personnes peuvent rester dans les conversations des destinataires, mais ils sont anonymisés et indiqués comme provenant d'un compte supprimé.",
  },
  pl: {
    eyebrow: "Konto ghostel.app",
    title: "Usuwanie konta i danych",
    intro:
      "Konto ghostel.app można usunąć bezpośrednio w aplikacji. Operacja jest trwała i wymaga zalogowania na konto, które ma zostać usunięte.",
    stepsTitle: "Jak usunąć konto",
    steps: [
      "Otwórz aplikację ghostel.app i zaloguj się na konto.",
      "Przejdź do zakładki Profil.",
      "W sekcji Prywatność wybierz Usuń konto.",
      "Potwierdź operację przyciskiem Usuń trwale.",
      "Po zakończeniu aplikacja wyloguje Cię automatycznie.",
    ],
    deletedTitle: "Co zostanie usunięte",
    deletedItems: [
      "Profil, e-mail, nazwa, avatar i ustawienia konta.",
      "Tokeny push i dane urządzeń.",
      "Kontakty, zaproszenia i blokady.",
      "Prywatne załączniki i historia połączeń.",
    ],
    remainTitle: "Co może zostać zachowane",
    remainBody:
      "Wiadomości wysłane do innych osób mogą pozostać w rozmowach odbiorców, ale zostaną zanonimizowane i oznaczone jako treści po usuniętym koncie.",
  },
};

export default function DeleteAccount() {
  const { lang } = useLang();
  const copy = deleteAccountCopy[lang] || deleteAccountCopy.en;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
          {copy.eyebrow}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          {copy.title}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">{copy.intro}</p>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-5">{copy.stepsTitle}</h2>
            <ol className="space-y-4">
              {copy.steps.map((step, index) => (
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
            <h2 className="font-display text-xl font-bold text-white mb-5">{copy.deletedTitle}</h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              {copy.deletedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="surface rounded-2xl p-7 mt-6">
          <h2 className="font-display text-xl font-bold text-white mb-3">{copy.remainTitle}</h2>
          <p className="text-zinc-300 leading-relaxed">{copy.remainBody}</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
