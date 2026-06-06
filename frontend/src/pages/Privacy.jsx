import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";

export default function Privacy() {
  const { lang } = useLang();
  const isPl = lang === "pl";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
          Ghostel
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          {isPl ? "Polityka prywatności" : "Privacy policy"}
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">
          {isPl
            ? "Ta strona opisuje podstawowe zasady przetwarzania danych w aplikacji Ghostel. Przed publikacją uzupełnij ją o oficjalne dane operatora, adres kontaktowy i docelową domenę usługi."
            : "This page describes the basic data processing rules for the Ghostel app. Before publication, complete it with the official operator details, contact address and production service domain."}
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Jakie dane przetwarzamy" : "Data we process"}
            </h2>
            <p>
              {isPl
                ? "Ghostel może przetwarzać dane konta, takie jak adres e-mail, nazwa użytkownika, nazwa wyświetlana, avatar, status, kontakty, zaproszenia, ustawienia profilu, tokeny push oraz metadane rozmów i połączeń."
                : "Ghostel may process account data such as email address, username, display name, avatar, status, contacts, invitations, profile settings, push tokens and message or call metadata."}
            </p>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Cel przetwarzania" : "Purpose of processing"}
            </h2>
            <p>
              {isPl
                ? "Dane są wykorzystywane do działania konta, logowania, kontaktów, wiadomości, połączeń głosowych, powiadomień push, ustawień bezpieczeństwa, eksportu danych i obsługi usługi."
                : "Data is used to operate accounts, sign-in, contacts, messages, voice calls, push notifications, security settings, data export and service maintenance."}
            </p>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Uprawnienia aplikacji" : "App permissions"}
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>{isPl ? "Mikrofon: rozmowy głosowe i wiadomości audio." : "Microphone: voice calls and audio messages."}</li>
              <li>{isPl ? "Aparat i zdjęcia: avatar oraz obrazy w rozmowach." : "Camera and photos: avatar and images in conversations."}</li>
              <li>{isPl ? "Powiadomienia: wiadomości i połączenia przychodzące." : "Notifications: messages and incoming calls."}</li>
              <li>{isPl ? "Full-screen intent: ekran połączenia przychodzącego." : "Full-screen intent: incoming call screen."}</li>
            </ul>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Eksport i usuwanie danych" : "Data export and deletion"}
            </h2>
            <p>
              {isPl
                ? "W profilu aplikacji użytkownik może pobrać swoje dane oraz trwale usunąć konto. Usunięcie konta usuwa profil, kontakty, zaproszenia, tokeny push i dane prywatne, a wiadomości wysłane do innych osób mogą zostać zanonimizowane."
                : "The app profile lets users export their data and permanently delete the account. Account deletion removes profile, contacts, invitations, push tokens and private data, while messages sent to other users may be anonymized."}
            </p>
          </section>

          <section className="surface rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-white mb-3">
              {isPl ? "Kontakt" : "Contact"}
            </h2>
            <p>
              {isPl
                ? "Przed publikacją wpisz tutaj oficjalny adres e-mail operatora aplikacji Ghostel."
                : "Before publication, add the official contact email for the Ghostel app operator here."}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
