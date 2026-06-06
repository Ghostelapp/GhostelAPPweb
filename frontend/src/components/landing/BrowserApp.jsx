import { motion } from "framer-motion";
import { ArrowUpRight, Check, Globe2, LockKeyhole, MessageCircle, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { GHOSTEL_WEB_APP_URL } from "@/lib/constants";

export default function BrowserApp() {
  const { lang } = useLang();
  const copy = lang === "pl"
    ? {
        eyebrow: "Ghostel Web",
        title: "Twoje rozmowy są dostępne również w przeglądarce",
        subtitle:
          "Zaloguj się na komputerze lub telefonie bez instalowania programu. Wersja webowa korzysta z tego samego konta, kontaktów i rozmów co aplikacja mobilna.",
        cta: "Otwórz Ghostel Web",
        points: [
          "Prywatne i grupowe rozmowy w czasie rzeczywistym",
          "Kontakty, połączenia i ustawienia konta",
          "Instalacja jako PWA bez sklepu z aplikacjami",
        ],
        status: "Połączono z Ghostel",
        message: "Wersja webowa jest gotowa.",
        navigation: ["Rozmowy", "Kontakty", "Połączenia", "Profil"],
      }
    : {
        eyebrow: "Ghostel Web",
        title: "Your conversations are also available in the browser",
        subtitle:
          "Sign in on a computer or phone without installing software. The web version uses the same account, contacts and conversations as the mobile app.",
        cta: "Open Ghostel Web",
        points: [
          "Private and group conversations in real time",
          "Contacts, calls and account settings",
          "Installable as a PWA without an app store",
        ],
        status: "Connected to Ghostel",
        message: "The web version is ready.",
        navigation: ["Chats", "Contacts", "Calls", "Profile"],
      };

  return (
    <section id="web-app" data-testid="web-app-section" className="relative py-24 sm:py-32 border-y border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-5">
            <Globe2 className="w-4 h-4" />
            {copy.eyebrow}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5">
            {copy.title}
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed mb-8">{copy.subtitle}</p>

          <ul className="space-y-4 mb-9">
            {copy.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="w-6 h-6 shrink-0 rounded-md bg-cyan-400/10 border border-cyan-400/20 grid place-items-center">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                </span>
                <span className="pt-0.5">{point}</span>
              </li>
            ))}
          </ul>

          <Button
            data-testid="web-app-cta"
            size="lg"
            onClick={() => (window.location.href = GHOSTEL_WEB_APP_URL)}
            className="btn-cyan rounded-md px-8 h-12 text-sm"
          >
            {copy.cta}
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="rounded-lg border border-white/10 bg-[#0b1016] overflow-hidden shadow-2xl shadow-black/40">
            <div className="h-11 border-b border-white/10 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <LockKeyhole className="w-3 h-3 text-cyan-400" />
                app.ghostel.app
              </div>
              <Monitor className="w-4 h-4 text-zinc-600" />
            </div>

            <div className="grid grid-cols-[128px_1fr] sm:grid-cols-[180px_1fr] min-h-[360px]">
              <div className="border-r border-white/10 p-4">
                <div className="flex items-center gap-2 mb-7">
                  <div className="w-8 h-8 rounded-md bg-cyan-400 text-[#071018] grid place-items-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:block font-display text-sm font-bold text-white">Ghostel</span>
                </div>
                {copy.navigation.map((item, index) => (
                  <div
                    key={item}
                    className={`h-9 flex items-center px-3 mb-2 rounded-md text-xs ${
                      index === 0 ? "bg-cyan-400/10 text-cyan-400" : "text-zinc-500"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-5">
                  <div>
                    <div className="text-sm font-semibold text-white">Ghostel Web</div>
                    <div className="text-[10px] text-emerald-400 mt-1">{copy.status}</div>
                  </div>
                  <Smartphone className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex-1 p-5 sm:p-7 flex flex-col justify-end gap-3">
                  <div className="max-w-[78%] rounded-lg rounded-bl-sm bg-white/[0.06] border border-white/5 p-3 text-xs text-zinc-300">
                    {copy.message}
                  </div>
                  <div className="max-w-[82%] self-end rounded-lg rounded-br-sm bg-cyan-400/15 border border-cyan-400/15 p-3 text-xs text-zinc-200">
                    {copy.points[0]}
                  </div>
                </div>
                <div className="h-16 border-t border-white/10 p-3">
                  <div className="h-full rounded-md border border-white/10 bg-white/[0.025]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
