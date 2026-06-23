import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, ShieldCheck, Smartphone, Download, Apple, Send } from "lucide-react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ANDROID_APK_URL =
  "https://api.ghostel.app/app-release.apk";
const TESTFLIGHT_APP_URL = "https://apps.apple.com/app/testflight/id899247664";
const TESTER_APP_VERSION = "1.4.27";

export default function TesterAccess() {
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
        `Tester chce dolaczyc do testow Ghostel na platformie: ${platformLabel}.`,
        `Email sklepu: ${form.store_email}.`,
        `Model telefonu: ${form.device_model || "nie podano"}.`,
        form.note ? `Dodatkowe informacje: ${form.note}` : "Dodatkowe informacje: brak.",
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
        text: `Zgloszenie wyslane. Numer: ${response.data?.ticket_id || "nowe"}.`,
      });
    } catch (error) {
      setSubmitState({ type: "error", text: formatApiError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-white">
      <main className="relative overflow-hidden px-6 py-12 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              Private tester access
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
              Ghostel - instrukcja do testów
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
              Ta strona nie jest linkowana z menu i jest przeznaczona tylko dla osób,
              które otrzymały bezpośredni link. Znajdziesz tu aktualne instrukcje dla
              Androida i iPhone&apos;a oraz linki do bieżącej wersji testowej.
            </p>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-3xl p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                <Download className="h-4 w-4" />
                Android APK
              </div>
              <h2 className="font-display text-3xl font-bold">Android 1.4.27 (27)</h2>
              <p className="mt-3 text-zinc-400">
                Pobierz plik APK, zezwól na instalację z tego źródła i uruchom aplikację.
              </p>
              <p className="mt-3 text-sm leading-6 text-amber-300">
                Jeśli pojawi się komunikat "Aplikacja nie została zainstalowana",
                usuń wcześniejszą wersję Ghostel z telefonu i spróbuj ponownie.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 font-semibold text-zinc-950 hover:opacity-95"
                >
                  <a href={ANDROID_APK_URL} target="_blank" rel="noreferrer">
                    Pobierz APK
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </section>

            <section className="glass rounded-3xl p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <Apple className="h-4 w-4" />
                iPhone / TestFlight
              </div>
              <h2 className="font-display text-3xl font-bold">iOS 1.4.27 (23)</h2>
              <p className="mt-3 text-zinc-400">
                Na iOS testy odbywają się przez TestFlight. Najpierw zainstaluj TestFlight,
                potem otwórz zaproszenie do testów albo publiczny link TestFlight od zespołu Ghostel.
              </p>
              <p className="mt-3 text-sm leading-6 text-amber-300">
                Sama strona builda w Expo nie jest linkiem instalacyjnym dla testera i nie
                wystarczy do pobrania aplikacji na iPhone.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-white/10 bg-white/5 px-5 text-white hover:bg-white/10"
                >
                  <a href={TESTFLIGHT_APP_URL} target="_blank" rel="noreferrer">
                    Zainstaluj TestFlight
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </section>
          </div>

          <section className="mb-8 glass rounded-3xl p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
              <Send className="h-4 w-4" />
              Zgloszenie do testow
            </div>
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <h2 className="font-display text-3xl font-bold">Chcesz testowac Ghostel?</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Wyslij zgloszenie i podaj adres e-mail, na ktorym masz konto Google Play
                  albo iCloud. Ten adres jest potrzebny, zeby dodac Cie do odpowiedniej grupy
                  testerow Android lub iOS.
                </p>
                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                  Android: podaj e-mail konta Google Play. iOS: podaj e-mail Apple ID/iCloud
                  uzywany w TestFlight.
                </div>
              </div>

              <form onSubmit={submitTesterRequest} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-zinc-400">Imie / nazwa testera</Label>
                    <Input
                      required
                      minLength={2}
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      className="mt-2 border-white/10 bg-white/5 text-white"
                      placeholder="Np. Patryk"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-zinc-400">Platforma</Label>
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
                    <Label className="text-xs uppercase tracking-wider text-zinc-400">E-mail Google Play / iCloud</Label>
                    <Input
                      required
                      type="email"
                      value={form.store_email}
                      onChange={(e) => updateForm("store_email", e.target.value)}
                      className="mt-2 border-white/10 bg-white/5 text-white"
                      placeholder={form.platform === "ios" ? "appleid@icloud.com" : "konto@gmail.com"}
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-zinc-400">Model telefonu</Label>
                    <Input
                      value={form.device_model}
                      onChange={(e) => updateForm("device_model", e.target.value)}
                      className="mt-2 border-white/10 bg-white/5 text-white"
                      placeholder="Np. iPhone 14 / Samsung S23"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-zinc-400">Dodatkowa informacja</Label>
                  <Textarea
                    value={form.note}
                    onChange={(e) => updateForm("note", e.target.value)}
                    className="mt-2 min-h-[100px] border-white/10 bg-white/5 text-white"
                    placeholder="Opcjonalnie: co chcesz testowac albo jaki masz problem z instalacja."
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
                  {submitting ? "Wysylanie..." : "Wyslij zgloszenie testera"}
                </Button>
              </form>
            </div>
          </section>

          <div className="grid gap-8">
            <section className="glass rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-cyan-300" />
                <h2 className="font-display text-2xl font-bold">Android - instrukcja krok po kroku</h2>
              </div>
              <img
                src="/tester-android-steps.svg"
                alt="Instrukcja dla testerów Ghostel na Androidzie"
                className="w-full rounded-2xl border border-white/10"
                loading="lazy"
              />
            </section>

            <section className="glass rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <Apple className="h-5 w-5 text-blue-300" />
                <h2 className="font-display text-2xl font-bold">iPhone / iOS - instrukcja krok po kroku</h2>
              </div>
              <img
                src="/tester-ios-steps.svg"
                alt="Instrukcja dla testerów Ghostel na iOS"
                className="w-full rounded-2xl border border-white/10"
                loading="lazy"
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
