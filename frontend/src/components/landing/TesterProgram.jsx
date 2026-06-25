import { Link } from "react-router-dom";
import { Award, Bug, Bitcoin, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

const copy = {
  en: {
    eyebrow: "Public testing program",
    title: "Help test Ghostel on Android and iOS",
    desc: "Join the public tester program, report bugs from real devices and help stabilize calls, notifications and installation flows before wider release.",
    rewardTitle: "BTC rewards for top bug hunters",
    rewardDesc: "The testers with the highest number of verified, useful bug reports may receive rewards in Bitcoin. Duplicate, low-quality or abusive reports do not count.",
    bugs: "Report reproducible bugs",
    devices: "Test Android and iPhone builds",
    cta: "Join testing",
  },
  pl: {
    eyebrow: "Publiczny program testów",
    title: "Pomóż testować Ghostel na Androidzie i iOS",
    desc: "Dołącz do publicznych testów, zgłaszaj błędy z prawdziwych telefonów i pomóż ustabilizować połączenia, powiadomienia oraz instalację aplikacji.",
    rewardTitle: "Nagrody BTC dla najlepszych testerów",
    rewardDesc: "Testerzy z największą liczbą potwierdzonych i wartościowych zgłoszeń błędów mogą otrzymać nagrody w Bitcoinie. Duplikaty, słabe lub spamowe zgłoszenia nie są liczone.",
    bugs: "Zgłaszaj powtarzalne błędy",
    devices: "Testuj buildy Android i iPhone",
    cta: "Dołącz do testów",
  },
  de: {
    eyebrow: "Öffentliches Testprogramm",
    title: "Teste Ghostel auf Android und iOS",
    desc: "Nimm am öffentlichen Testerprogramm teil, melde Fehler von echten Geräten und hilf, Anrufe, Benachrichtigungen und Installation zu stabilisieren.",
    rewardTitle: "BTC-Belohnungen für Top-Bug-Hunter",
    rewardDesc: "Tester mit den meisten bestätigten und nützlichen Bug-Reports können Belohnungen in Bitcoin erhalten. Duplikate, schwache oder missbräuchliche Meldungen zählen nicht.",
    bugs: "Reproduzierbare Fehler melden",
    devices: "Android- und iPhone-Builds testen",
    cta: "Tester werden",
  },
  es: {
    eyebrow: "Programa público de pruebas",
    title: "Ayuda a probar Ghostel en Android e iOS",
    desc: "Únete al programa público de testers, reporta errores desde dispositivos reales y ayuda a estabilizar llamadas, notificaciones e instalación.",
    rewardTitle: "Recompensas BTC para los mejores testers",
    rewardDesc: "Los testers con más reportes de errores verificados y útiles podrán recibir recompensas en Bitcoin. Los duplicados, reportes de baja calidad o abusivos no cuentan.",
    bugs: "Reporta errores reproducibles",
    devices: "Prueba builds de Android y iPhone",
    cta: "Unirme a las pruebas",
  },
  fr: {
    eyebrow: "Programme public de test",
    title: "Aidez à tester Ghostel sur Android et iOS",
    desc: "Rejoignez le programme public de test, signalez les bugs sur de vrais appareils et aidez à stabiliser les appels, les notifications et l'installation.",
    rewardTitle: "Récompenses BTC pour les meilleurs testeurs",
    rewardDesc: "Les testeurs avec le plus de rapports de bugs vérifiés et utiles pourront recevoir des récompenses en Bitcoin. Les doublons, rapports faibles ou abusifs ne comptent pas.",
    bugs: "Signaler des bugs reproductibles",
    devices: "Tester les builds Android et iPhone",
    cta: "Rejoindre les tests",
  },
};

export default function TesterProgram() {
  const { lang } = useLang();
  const t = copy[lang] || copy.en;

  return (
    <section id="testers" data-testid="tester-program-section" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_80%_50%,rgba(168,85,247,0.12),transparent_28%)]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="glass rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                <Bug className="h-4 w-4" />
                {t.eyebrow}
              </div>
              <h2 className="font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                {t.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
                {t.desc}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-200">
                  <Bug className="mb-3 h-5 w-5 text-cyan-300" />
                  {t.bugs}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-200">
                  <Award className="mb-3 h-5 w-5 text-fuchsia-300" />
                  {t.devices}
                </div>
              </div>
              <Button asChild className="mt-7 h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 font-semibold text-zinc-950 hover:opacity-95">
                <Link to="/testers">
                  {t.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
                <Bitcoin className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white">{t.rewardTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-amber-100">{t.rewardDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
