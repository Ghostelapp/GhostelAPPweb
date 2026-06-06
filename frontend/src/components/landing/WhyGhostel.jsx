import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import {
  BellRing,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Smartphone,
  UserX,
} from "lucide-react";

export default function WhyGhostel() {
  const { lang } = useLang();
  const copy = lang === "pl"
    ? {
        eyebrow: "Bezpieczeństwo bez niedomówień",
        title: "Co chroni rozmowy już teraz",
        subtitle:
          "Ghostel rozdziela treść rozmów od danych operacyjnych potrzebnych do działania usługi. Poniżej pokazujemy zabezpieczenia aktywne obecnie oraz kierunki dalszego rozwoju.",
        currentLabel: "Dostępne obecnie",
        current: [
          { icon: LockKeyhole, title: "E2EE wiadomości i załączników", desc: "Treść jest szyfrowana na urządzeniu. Serwer przechowuje zaszyfrowany ładunek, gdy wszyscy uczestnicy rozmowy mają klucze urządzeń." },
          { icon: KeyRound, title: "Weryfikacja kluczy urządzeń", desc: "Zmiana klucza urządzenia wstrzymuje wysyłanie, dopóki użytkownik nie potwierdzi nowego odcisku klucza." },
          { icon: ShieldCheck, title: "Szyfrowane połączenia", desc: "Sygnalizacja połączenia jest szyfrowana end-to-end, a media głosowe chroni WebRTC DTLS-SRTP." },
          { icon: Fingerprint, title: "2FA i lokalna blokada PIN", desc: "Konto może wymagać kodu 2FA, a aplikację można blokować PIN-em zapisanym jako skrót w bezpiecznym magazynie urządzenia." },
          { icon: Smartphone, title: "Bezpieczne dane na urządzeniu", desc: "Token logowania i prywatne klucze są przechowywane przez systemowy SecureStore zamiast zwykłej pamięci aplikacji." },
          { icon: UserX, title: "Prywatność i kontrola konta", desc: "Blokowanie kontaktów, ustawienia prywatności, eksport danych oraz trwałe usunięcie konta są dostępne bezpośrednio dla użytkownika." },
        ],
        roadmapLabel: "Kierunek rozwoju",
        roadmapTitle: "Kolejne warstwy ochrony",
        roadmapNote: "Roadmapa opisuje planowany kierunek i może zmieniać się wraz z testami oraz audytami.",
        roadmap: [
          { icon: Radar, title: "Niezależny audyt bezpieczeństwa", desc: "Przegląd architektury, aplikacji i infrastruktury przez zewnętrznych specjalistów przed szerszą publikacją." },
          { icon: KeyRound, title: "Rozbudowana obsługa wielu urządzeń", desc: "Czytelniejsze zarządzanie zaufanymi urządzeniami, sesjami oraz potwierdzaniem zmian kluczy." },
          { icon: BellRing, title: "Alerty bezpieczeństwa konta", desc: "Lepsze powiadomienia o nowych logowaniach, zmianach zabezpieczeń i podejrzanej aktywności." },
        ],
        transparency:
          "Ważne: serwer nadal przetwarza dane konta, tokeny push, członkostwo rozmów, statusy oraz metadane potrzebne do dostarczenia wiadomości i połączeń.",
      }
    : {
        eyebrow: "Security without vague claims",
        title: "What protects conversations today",
        subtitle:
          "Ghostel separates conversation content from operational data required to run the service. Below are protections available today and the direction of future development.",
        currentLabel: "Available now",
        current: [
          { icon: LockKeyhole, title: "Message and attachment E2EE", desc: "Content is encrypted on-device. The server stores an encrypted payload when all conversation members have device keys." },
          { icon: KeyRound, title: "Device-key verification", desc: "A device-key change pauses sending until the user confirms the new key fingerprint." },
          { icon: ShieldCheck, title: "Encrypted calls", desc: "Call signaling is end-to-end encrypted, while voice media is protected by WebRTC DTLS-SRTP." },
          { icon: Fingerprint, title: "2FA and local PIN lock", desc: "Accounts can require a 2FA code, while the app can be locked with a PIN stored as a hash in the device secure store." },
          { icon: Smartphone, title: "Protected on-device data", desc: "Login tokens and private keys use the system SecureStore instead of ordinary app storage." },
          { icon: UserX, title: "Privacy and account control", desc: "Blocking, privacy controls, data export and permanent account deletion are directly available to users." },
        ],
        roadmapLabel: "Development direction",
        roadmapTitle: "The next protection layers",
        roadmapNote: "This roadmap describes planned direction and may change as testing and audits progress.",
        roadmap: [
          { icon: Radar, title: "Independent security audit", desc: "External review of the architecture, applications and infrastructure before broader release." },
          { icon: KeyRound, title: "Expanded multi-device controls", desc: "Clearer management of trusted devices, sessions and device-key changes." },
          { icon: BellRing, title: "Account security alerts", desc: "Better notifications for new sign-ins, security-setting changes and suspicious activity." },
        ],
        transparency:
          "Important: the server still processes account data, push tokens, conversation membership, presence and metadata required to deliver messages and calls.",
      };

  return (
    <section id="why" data-testid="why-section" className="relative py-24 sm:py-32 border-y divider-soft">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            {copy.eyebrow}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {copy.title}
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">{copy.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
            {copy.currentLabel}
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {copy.current.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                data-testid={`why-card-${i}`}
                className="flex gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-md bg-cyan-400/10 border border-cyan-400/20 grid place-items-center text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base mb-1.5">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 border-t divider-soft pt-14">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-4">
                {copy.roadmapLabel}
              </div>
              <h3 className="font-display text-3xl font-extrabold text-white mb-4">{copy.roadmapTitle}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{copy.roadmapNote}</p>
            </div>

            <div className="space-y-3">
              {copy.roadmap.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="surface rounded-lg p-5 flex gap-4"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-md bg-amber-300/10 border border-amber-300/20 grid place-items-center text-amber-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-base mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 border border-cyan-400/20 bg-cyan-400/[0.05] rounded-lg px-5 py-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-300 leading-relaxed">{copy.transparency}</p>
        </div>
      </div>
    </section>
  );
}
