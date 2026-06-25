import { useMemo, useState } from "react";
import {
  Apple,
  Bitcoin,
  Bug,
  CheckCircle2,
  Download,
  ExternalLink,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLang } from "@/context/LanguageContext";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ANDROID_APK_URL = "https://api.ghostel.app/app-release.apk";
const TESTFLIGHT_APP_URL = "https://apps.apple.com/app/testflight/id899247664";
const TESTER_APP_VERSION = "1.4.27";

const copy = {
  en: {
    eyebrow: "Public testing program",
    title: "Test Ghostel on Android and iOS",
    intro:
      "Join public Ghostel testing, install current test builds, report real bugs and help stabilize calls, notifications and installation flows.",
    androidTitle: "Android 1.4.27 (27)",
    androidDesc: "Download the APK, allow installation from this source and open the app.",
    androidNote:
      'If Android shows "App not installed", remove the older Ghostel build from the phone and try again.',
    apkButton: "Download APK",
    iosTitle: "iOS 1.4.27 (23)",
    iosDesc:
      "iOS testing uses TestFlight. Install TestFlight first, then open the invitation or the public TestFlight link from the Ghostel team.",
    iosNote: "An Expo build page is not an installation link for iPhone testers.",
    testflightButton: "Install TestFlight",
    rewardTitle: "BTC rewards for top bug reporters",
    rewardDesc:
      "The testers with the most verified and useful bug reports may receive rewards in Bitcoin. Duplicate, low-quality or abusive reports do not count.",
    rewardRules:
      "Reward eligibility is based on confirmed reports with clear steps, screenshots or logs, and real impact on Android/iOS testing.",
    formEyebrow: "Tester signup",
    formTitle: "Want to test Ghostel?",
    formDesc:
      "Send a request and enter the email used for Google Play or iCloud. This email is needed to add you to the correct Android or iOS tester group.",
    formNote: "Android: use your Google Play email. iOS: use the Apple ID/iCloud email used in TestFlight.",
    name: "Name / tester name",
    namePlaceholder: "Example: Patryk",
    platform: "Platform",
    storeEmail: "Google Play / iCloud email",
    deviceModel: "Phone model",
    devicePlaceholder: "Example: iPhone 14 / Samsung S23",
    note: "Additional information",
    notePlaceholder: "Optional: what you want to test or what installation issue you have.",
    submitting: "Sending...",
    submit: "Send tester request",
    success: "Request sent. Ticket:",
    androidSteps: "Android - step-by-step guide",
    iosSteps: "iPhone / iOS - step-by-step guide",
    androidAlt: "Ghostel Android tester guide",
    iosAlt: "Ghostel iOS tester guide",
  },
  pl: {
    eyebrow: "Publiczny program testów",
    title: "Testuj Ghostel na Androidzie i iOS",
    intro:
      "Dołącz do publicznych testów Ghostel, instaluj aktualne buildy testowe, zgłaszaj realne błędy i pomóż ustabilizować połączenia, powiadomienia oraz instalację.",
    androidTitle: "Android 1.4.27 (27)",
    androidDesc: "Pobierz plik APK, zezwól na instalację z tego źródła i uruchom aplikację.",
    androidNote:
      'Jeśli Android pokaże komunikat "Aplikacja nie została zainstalowana", usuń starszą wersję Ghostel z telefonu i spróbuj ponownie.',
    apkButton: "Pobierz APK",
    iosTitle: "iOS 1.4.27 (23)",
    iosDesc:
      "Na iOS testy odbywają się przez TestFlight. Najpierw zainstaluj TestFlight, potem otwórz zaproszenie albo publiczny link TestFlight od zespołu Ghostel.",
    iosNote: "Sama strona builda w Expo nie jest linkiem instalacyjnym dla testera iPhone.",
    testflightButton: "Zainstaluj TestFlight",
    rewardTitle: "Nagrody BTC dla najlepszych zgłaszających błędy",
    rewardDesc:
      "Testerzy z największą liczbą potwierdzonych i wartościowych zgłoszeń błędów mogą otrzymać nagrody w Bitcoinie. Duplikaty, słabe lub spamowe zgłoszenia nie są liczone.",
    rewardRules:
      "Liczą się potwierdzone zgłoszenia z jasnymi krokami odtworzenia, zrzutami ekranu lub logami oraz realnym wpływem na testy Android/iOS.",
    formEyebrow: "Zgłoszenie testera",
    formTitle: "Chcesz testować Ghostel?",
    formDesc:
      "Wyślij zgłoszenie i podaj adres e-mail używany w Google Play albo iCloud. Ten adres jest potrzebny, żeby dodać Cię do odpowiedniej grupy testerów Android lub iOS.",
    formNote: "Android: podaj e-mail Google Play. iOS: podaj Apple ID/iCloud używany w TestFlight.",
    name: "Imię / nazwa testera",
    namePlaceholder: "Np. Patryk",
    platform: "Platforma",
    storeEmail: "E-mail Google Play / iCloud",
    deviceModel: "Model telefonu",
    devicePlaceholder: "Np. iPhone 14 / Samsung S23",
    note: "Dodatkowa informacja",
    notePlaceholder: "Opcjonalnie: co chcesz testować albo jaki masz problem z instalacją.",
    submitting: "Wysyłanie...",
    submit: "Wyślij zgłoszenie testera",
    success: "Zgłoszenie wysłane. Numer:",
    androidSteps: "Android - instrukcja krok po kroku",
    iosSteps: "iPhone / iOS - instrukcja krok po kroku",
    androidAlt: "Instrukcja dla testerów Ghostel na Androidzie",
    iosAlt: "Instrukcja dla testerów Ghostel na iOS",
  },
  de: {
    eyebrow: "Öffentliches Testprogramm",
    title: "Teste Ghostel auf Android und iOS",
    intro:
      "Nimm am öffentlichen Ghostel-Test teil, installiere aktuelle Test-Builds, melde echte Fehler und hilf, Anrufe, Benachrichtigungen und Installation zu stabilisieren.",
    androidTitle: "Android 1.4.27 (27)",
    androidDesc: "Lade die APK herunter, erlaube die Installation aus dieser Quelle und öffne die App.",
    androidNote: 'Wenn Android "App nicht installiert" meldet, entferne die ältere Ghostel-Version und versuche es erneut.',
    apkButton: "APK herunterladen",
    iosTitle: "iOS 1.4.27 (23)",
    iosDesc:
      "iOS-Tests laufen über TestFlight. Installiere zuerst TestFlight und öffne danach die Einladung oder den öffentlichen TestFlight-Link vom Ghostel-Team.",
    iosNote: "Eine Expo-Build-Seite ist kein Installationslink für iPhone-Tester.",
    testflightButton: "TestFlight installieren",
    rewardTitle: "BTC-Belohnungen für die besten Bug-Reports",
    rewardDesc:
      "Tester mit den meisten bestätigten und nützlichen Fehlerberichten können Belohnungen in Bitcoin erhalten. Duplikate, schwache oder missbräuchliche Meldungen zählen nicht.",
    rewardRules:
      "Es zählen bestätigte Reports mit klaren Schritten, Screenshots oder Logs und echtem Einfluss auf Android/iOS-Tests.",
    formEyebrow: "Tester-Anmeldung",
    formTitle: "Möchtest du Ghostel testen?",
    formDesc:
      "Sende eine Anfrage und gib die E-Mail-Adresse für Google Play oder iCloud an. Diese Adresse wird benötigt, um dich zur passenden Android- oder iOS-Testergruppe hinzuzufügen.",
    formNote: "Android: Google-Play-E-Mail. iOS: Apple-ID/iCloud-E-Mail für TestFlight.",
    name: "Name / Testername",
    namePlaceholder: "Beispiel: Patryk",
    platform: "Plattform",
    storeEmail: "Google Play / iCloud E-Mail",
    deviceModel: "Telefonmodell",
    devicePlaceholder: "Beispiel: iPhone 14 / Samsung S23",
    note: "Zusätzliche Information",
    notePlaceholder: "Optional: was du testen möchtest oder welches Installationsproblem du hast.",
    submitting: "Wird gesendet...",
    submit: "Tester-Anfrage senden",
    success: "Anfrage gesendet. Ticket:",
    androidSteps: "Android - Schritt-für-Schritt-Anleitung",
    iosSteps: "iPhone / iOS - Schritt-für-Schritt-Anleitung",
    androidAlt: "Ghostel Android Tester-Anleitung",
    iosAlt: "Ghostel iOS Tester-Anleitung",
  },
  es: {
    eyebrow: "Programa público de pruebas",
    title: "Prueba Ghostel en Android e iOS",
    intro:
      "Únete a las pruebas públicas de Ghostel, instala builds actuales, reporta errores reales y ayuda a estabilizar llamadas, notificaciones e instalación.",
    androidTitle: "Android 1.4.27 (27)",
    androidDesc: "Descarga el APK, permite la instalación desde esta fuente y abre la aplicación.",
    androidNote: 'Si Android muestra "Aplicación no instalada", elimina la versión anterior de Ghostel e inténtalo de nuevo.',
    apkButton: "Descargar APK",
    iosTitle: "iOS 1.4.27 (23)",
    iosDesc:
      "Las pruebas en iOS se hacen con TestFlight. Instala TestFlight primero y luego abre la invitación o el enlace público de TestFlight del equipo Ghostel.",
    iosNote: "Una página de build de Expo no es un enlace de instalación para testers de iPhone.",
    testflightButton: "Instalar TestFlight",
    rewardTitle: "Recompensas BTC para los mejores reportes",
    rewardDesc:
      "Los testers con más reportes de errores verificados y útiles podrán recibir recompensas en Bitcoin. Los duplicados, reportes de baja calidad o abusivos no cuentan.",
    rewardRules:
      "Cuentan los reportes confirmados con pasos claros, capturas o logs, y con impacto real en las pruebas de Android/iOS.",
    formEyebrow: "Registro de tester",
    formTitle: "¿Quieres probar Ghostel?",
    formDesc:
      "Envía una solicitud e introduce el email usado en Google Play o iCloud. Ese email es necesario para añadirte al grupo correcto de testers Android o iOS.",
    formNote: "Android: email de Google Play. iOS: Apple ID/iCloud usado en TestFlight.",
    name: "Nombre / tester",
    namePlaceholder: "Ejemplo: Patryk",
    platform: "Plataforma",
    storeEmail: "Email de Google Play / iCloud",
    deviceModel: "Modelo de teléfono",
    devicePlaceholder: "Ejemplo: iPhone 14 / Samsung S23",
    note: "Información adicional",
    notePlaceholder: "Opcional: qué quieres probar o qué problema de instalación tienes.",
    submitting: "Enviando...",
    submit: "Enviar solicitud de tester",
    success: "Solicitud enviada. Ticket:",
    androidSteps: "Android - guía paso a paso",
    iosSteps: "iPhone / iOS - guía paso a paso",
    androidAlt: "Guía para testers Android de Ghostel",
    iosAlt: "Guía para testers iOS de Ghostel",
  },
  fr: {
    eyebrow: "Programme public de test",
    title: "Testez Ghostel sur Android et iOS",
    intro:
      "Rejoignez les tests publics de Ghostel, installez les builds de test, signalez les vrais bugs et aidez à stabiliser les appels, les notifications et l'installation.",
    androidTitle: "Android 1.4.27 (27)",
    androidDesc: "Téléchargez l'APK, autorisez l'installation depuis cette source et ouvrez l'application.",
    androidNote:
      'Si Android affiche "Application non installée", supprimez l’ancienne version de Ghostel du téléphone puis réessayez.',
    apkButton: "Télécharger l'APK",
    iosTitle: "iOS 1.4.27 (23)",
    iosDesc:
      "Les tests iOS passent par TestFlight. Installez d'abord TestFlight, puis ouvrez l'invitation ou le lien public TestFlight de l'équipe Ghostel.",
    iosNote: "Une page de build Expo n'est pas un lien d'installation pour les testeurs iPhone.",
    testflightButton: "Installer TestFlight",
    rewardTitle: "Récompenses BTC pour les meilleurs rapports",
    rewardDesc:
      "Les testeurs avec le plus de rapports de bugs vérifiés et utiles pourront recevoir des récompenses en Bitcoin. Les doublons, rapports faibles ou abusifs ne comptent pas.",
    rewardRules:
      "Les rapports confirmés avec étapes claires, captures ou logs, et un impact réel sur les tests Android/iOS sont pris en compte.",
    formEyebrow: "Inscription testeur",
    formTitle: "Vous voulez tester Ghostel ?",
    formDesc:
      "Envoyez une demande et indiquez l'adresse e-mail utilisée pour Google Play ou iCloud. Cette adresse sert à vous ajouter au bon groupe de test Android ou iOS.",
    formNote: "Android : e-mail Google Play. iOS : Apple ID/iCloud utilisé dans TestFlight.",
    name: "Nom / testeur",
    namePlaceholder: "Exemple : Patryk",
    platform: "Plateforme",
    storeEmail: "E-mail Google Play / iCloud",
    deviceModel: "Modèle du téléphone",
    devicePlaceholder: "Exemple : iPhone 14 / Samsung S23",
    note: "Information complémentaire",
    notePlaceholder: "Optionnel : ce que vous voulez tester ou votre problème d'installation.",
    submitting: "Envoi...",
    submit: "Envoyer la demande de test",
    success: "Demande envoyée. Ticket :",
    androidSteps: "Android - guide étape par étape",
    iosSteps: "iPhone / iOS - guide étape par étape",
    androidAlt: "Guide testeur Ghostel Android",
    iosAlt: "Guide testeur Ghostel iOS",
  },
};

export default function TesterAccess() {
  const { lang } = useLang();
  const t = copy[lang] || copy.en;
  const startedAt = useMemo(() => Date.now(), []);
  const [form, setForm] = useState({
    name: "",
    platform: "android",
    store_email: "",
    device_model: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState(null);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitState(null);
  };

  const submitTesterRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitState(null);
    try {
      const platformLabel = form.platform === "ios" ? "iOS / TestFlight" : "Android / Google Play";
      const message = [
        `Tester wants to join Ghostel testing on: ${platformLabel}.`,
        `Store email: ${form.store_email}.`,
        `Phone model: ${form.device_model || "not provided"}.`,
        form.note ? `Additional information: ${form.note}` : "Additional information: none.",
      ].join("\n");

      const response = await api.post("/contact", {
        name: form.name,
        email: form.store_email,
        subject: `Tester access request - ${platformLabel}`,
        category: "tester",
        message,
        app_platform: form.platform,
        app_version: TESTER_APP_VERSION,
        tester_platform: form.platform,
        store_email: form.store_email,
        device_model: form.device_model,
        submitted_after_ms: Date.now() - startedAt,
      });
      setForm({ name: "", platform: "android", store_email: "", device_model: "", note: "" });
      setSubmitState({
        type: "success",
        text: `${t.success} ${response.data?.ticket_id || "new"}.`,
      });
    } catch (error) {
      setSubmitState({ type: "error", text: formatApiError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-white">
      <Navbar />
      <main className="relative overflow-hidden px-6 pb-16 pt-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              {t.eyebrow}
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">{t.intro}</p>
          </section>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-3xl p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                <Download className="h-4 w-4" />
                Android APK
              </div>
              <h2 className="font-display text-3xl font-bold">{t.androidTitle}</h2>
              <p className="mt-3 text-zinc-400">{t.androidDesc}</p>
              <p className="mt-3 text-sm leading-6 text-amber-300">{t.androidNote}</p>
              <Button asChild className="mt-6 h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 font-semibold text-zinc-950 hover:opacity-95">
                <a href={ANDROID_APK_URL} target="_blank" rel="noreferrer">
                  {t.apkButton}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </section>

            <section className="glass rounded-3xl p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <Apple className="h-4 w-4" />
                iPhone / TestFlight
              </div>
              <h2 className="font-display text-3xl font-bold">{t.iosTitle}</h2>
              <p className="mt-3 text-zinc-400">{t.iosDesc}</p>
              <p className="mt-3 text-sm leading-6 text-amber-300">{t.iosNote}</p>
              <Button asChild variant="outline" className="mt-6 h-11 rounded-xl border-white/10 bg-white/5 px-5 text-white hover:bg-white/10">
                <a href={TESTFLIGHT_APP_URL} target="_blank" rel="noreferrer">
                  {t.testflightButton}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </section>
          </div>

          <section className="mb-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
                <Bitcoin className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-bold">{t.rewardTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-amber-100">{t.rewardDesc}</p>
              <p className="mt-3 text-sm leading-6 text-amber-200/90">{t.rewardRules}</p>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <Bug className="h-5 w-5 text-cyan-300" />
                <h2 className="font-display text-2xl font-bold">{t.formTitle}</h2>
              </div>
              <p className="text-sm leading-6 text-zinc-400">{t.formDesc}</p>
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                {t.formNote}
              </div>
            </div>
          </section>

          <section className="mb-8 glass rounded-3xl p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
              <Send className="h-4 w-4" />
              {t.formEyebrow}
            </div>

            <form onSubmit={submitTesterRequest} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-zinc-400">{t.name}</Label>
                  <Input
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="mt-2 border-white/10 bg-white/5 text-white"
                    placeholder={t.namePlaceholder}
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-zinc-400">{t.platform}</Label>
                  <select
                    value={form.platform}
                    onChange={(e) => updateForm("platform", e.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    <option className="bg-zinc-950" value="android">Android / Google Play</option>
                    <option className="bg-zinc-950" value="ios">iOS / iCloud / TestFlight</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-zinc-400">{t.storeEmail}</Label>
                  <Input
                    required
                    type="email"
                    value={form.store_email}
                    onChange={(e) => updateForm("store_email", e.target.value)}
                    className="mt-2 border-white/10 bg-white/5 text-white"
                    placeholder={form.platform === "ios" ? "appleid@icloud.com" : "account@gmail.com"}
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-zinc-400">{t.deviceModel}</Label>
                  <Input
                    value={form.device_model}
                    onChange={(e) => updateForm("device_model", e.target.value)}
                    className="mt-2 border-white/10 bg-white/5 text-white"
                    placeholder={t.devicePlaceholder}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-400">{t.note}</Label>
                <Textarea
                  value={form.note}
                  onChange={(e) => updateForm("note", e.target.value)}
                  className="mt-2 min-h-[100px] border-white/10 bg-white/5 text-white"
                  placeholder={t.notePlaceholder}
                />
              </div>

              {submitState && (
                <div
                  className={`rounded-2xl border p-4 text-sm ${
                    submitState.type === "success"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                      : "border-red-400/20 bg-red-400/10 text-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {submitState.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                    {submitState.text}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-semibold text-zinc-950 hover:opacity-95"
              >
                <Send className="h-4 w-4" />
                {submitting ? t.submitting : t.submit}
              </Button>
            </form>
          </section>

          <div className="grid gap-8">
            <section className="glass rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-cyan-300" />
                <h2 className="font-display text-2xl font-bold">{t.androidSteps}</h2>
              </div>
              <img
                src="/tester-android-steps.svg"
                alt={t.androidAlt}
                className="w-full rounded-2xl border border-white/10"
                loading="lazy"
              />
            </section>

            <section className="glass rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <Apple className="h-5 w-5 text-blue-300" />
                <h2 className="font-display text-2xl font-bold">{t.iosSteps}</h2>
              </div>
              <img
                src="/tester-ios-steps.svg"
                alt={t.iosAlt}
                className="w-full rounded-2xl border border-white/10"
                loading="lazy"
              />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
