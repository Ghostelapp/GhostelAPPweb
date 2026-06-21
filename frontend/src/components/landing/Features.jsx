import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { BellRing, Download, PhoneCall, ShieldCheck, UserRoundPlus, UsersRound } from "lucide-react";

export default function Features() {
  const { lang, t } = useLang();
  let copy = lang === "pl"
    ? {
        eyebrow: "Najważniejsze możliwości",
        title: "Komunikacja bez zbędnego chaosu",
        subtitle:
          "ghostel.app skupia wiadomości, kontakty, połączenia i kontrolę prywatności w jednej aplikacji, bez ukrywania ważnych ustawień.",
        items: [
          { icon: UserRoundPlus, title: "Wiadomości i kontakty", desc: "Prywatne rozmowy, kontakty po nazwie użytkownika, reakcje i czytelna historia konwersacji." },
          { icon: UsersRound, title: "Rozmowy grupowe", desc: "Twórz grupy, zarządzaj członkami i korzystaj z szyfrowania, gdy urządzenia uczestników mają aktywne klucze." },
          { icon: PhoneCall, title: "Połączenia głosowe", desc: "Rozmawiaj przez WebRTC z szyfrowanymi mediami oraz szyfrowaną sygnalizacją między urządzeniami." },
          { icon: BellRing, title: "Powiadomienia połączeń", desc: "Dedykowane alerty połączeń z dźwiękiem, wibracją i ekranem odbierania na Androidzie." },
          { icon: Download, title: "Kontrola własnych danych", desc: "Eksportuj dane konta albo trwale usuń konto bez konieczności kontaktowania się z administratorem." },
          { icon: ShieldCheck, title: "Ochrona konta i aplikacji", desc: "Włącz kod 2FA, blokadę aplikacji PIN-em i zarządzaj listą zablokowanych użytkowników." },
        ],
      }
    : lang === "de"
    ? {
        eyebrow: "Wichtigste Funktionen",
        title: "Kommunikation ohne unnötiges Chaos",
        subtitle:
          "ghostel.app vereint Nachrichten, Kontakte, Anrufe und Datenschutzkontrollen in einer App, ohne wichtige Einstellungen zu verstecken.",
        items: [
          { icon: UserRoundPlus, title: "Nachrichten und Kontakte", desc: "Private Unterhaltungen, Kontakte per Benutzername, Reaktionen und ein übersichtlicher Verlauf." },
          { icon: UsersRound, title: "Gruppenunterhaltungen", desc: "Erstelle Gruppen, verwalte Mitglieder und nutze Verschlüsselung, wenn die Geräte aktive Schlüssel besitzen." },
          { icon: PhoneCall, title: "Sprachanrufe", desc: "Telefoniere über WebRTC mit verschlüsselten Medien und Ende-zu-Ende-verschlüsselter Signalisierung." },
          { icon: BellRing, title: "Anrufbenachrichtigungen", desc: "Eigene Android-Anrufhinweise mit Ton, Vibration und Anrufbildschirm." },
          { icon: Download, title: "Kontrolle über deine Daten", desc: "Exportiere Kontodaten oder lösche dein Konto dauerhaft ohne Kontakt zum Administrator." },
          { icon: ShieldCheck, title: "Konto- und App-Schutz", desc: "Aktiviere 2FA, schütze die App mit einer PIN und verwalte blockierte Benutzer." },
        ],
      }
    : {
        eyebrow: "Core capabilities",
        title: "Communication without unnecessary noise",
        subtitle:
          "ghostel.app brings messages, contacts, calls and privacy controls into one app without hiding important settings.",
        items: [
          { icon: UserRoundPlus, title: "Messages and contacts", desc: "Private conversations, username-based contacts, reactions and a clear conversation history." },
          { icon: UsersRound, title: "Group conversations", desc: "Create groups, manage members and use encryption when participant devices have active keys." },
          { icon: PhoneCall, title: "Voice calls", desc: "Talk over WebRTC with encrypted media and end-to-end encrypted signaling between devices." },
          { icon: BellRing, title: "Incoming call alerts", desc: "Dedicated Android call alerts with sound, vibration and an answer screen." },
          { icon: Download, title: "Control your data", desc: "Export account data or permanently delete your account without contacting an administrator." },
          { icon: ShieldCheck, title: "Account and app protection", desc: "Enable 2FA, protect the app with a PIN and manage blocked users." },
        ],
      };

  if (lang === "es" || lang === "fr") {
    copy = {
      eyebrow: lang === "es" ? "Funciones principales" : "Fonctionnalités principales",
      title: t("features.title"),
      subtitle: t("features.subtitle"),
      items: [
        { icon: UserRoundPlus, title: t("features.messagesTitle"), desc: t("features.messagesDesc") },
        { icon: UsersRound, title: t("features.groupsTitle"), desc: t("features.groupsDesc") },
        { icon: PhoneCall, title: t("features.voiceTitle"), desc: t("features.voiceDesc") },
        { icon: BellRing, title: t("features.filesTitle"), desc: t("features.filesDesc") },
        { icon: Download, title: t("features.pushTitle"), desc: t("features.pushDesc") },
        { icon: ShieldCheck, title: t("features.securityTitle"), desc: t("features.securityDesc") },
      ],
    };
  }

  return (
    <section id="features" data-testid="features-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            {copy.eyebrow}
          </div>
          <h2 data-testid="features-title" className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {copy.title}
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">{copy.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {copy.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                data-testid={`feature-card-${i}`}
                className="surface surface-hover rounded-lg p-7 group"
              >
                <div className="w-11 h-11 rounded-md bg-cyan-400/10 border border-cyan-400/20 grid place-items-center text-cyan-400 mb-5 group-hover:bg-cyan-400/15 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
