import { motion } from "framer-motion";
import { useLang } from "@/context/LanguageContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { Check, Download, Globe2, MonitorDown, Smartphone } from "lucide-react";
import { useLatestRelease } from "@/hooks/useLatestRelease";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const { t, lang } = useLang();
  const { version, apkUrl } = useLatestRelease();
  const pricingCopy = {
    pl: {
      webName: "Wersja webowa", development: "W budowie", webCta: "Wersja webowa w budowie",
      webFeatures: ["Bez instalowania programu", "To samo konto i kontakty", "Czat, połączenia i ustawienia", "Możliwość instalacji jako PWA"],
      androidCta: "Pobierz APK na Androida", iosLabel: "W przygotowaniu", iosCta: "Wersja iOS w przygotowaniu",
      iosFeatures: ["Przygotowujemy wersję na iPhone", "To samo konto i kontakty", "Czat i połączenia głosowe", "Publikacja po testach iOS"],
    },
    de: {
      webName: "Web-App", development: "In Entwicklung", webCta: "Web-App in Entwicklung",
      webFeatures: ["Keine Softwareinstallation", "Dasselbe Konto und dieselben Kontakte", "Chats, Anrufe und Einstellungen", "Als PWA installierbar"],
      androidCta: "Android-APK herunterladen", iosLabel: "In Vorbereitung", iosCta: "iOS-Version in Vorbereitung",
      iosFeatures: ["Wir bereiten die iPhone-Version vor", "Dasselbe Konto und dieselben Kontakte", "Chats und Sprachanrufe", "Veröffentlichung nach iOS-Tests"],
    },
    en: {
      webName: "Web app", development: "In development", webCta: "Web app in development",
      webFeatures: ["No software installation", "The same account and contacts", "Chat, calls and settings", "Installable as a PWA"],
      androidCta: "Download Android APK", iosLabel: "Coming soon", iosCta: "iOS version coming soon",
      iosFeatures: ["We are preparing the iPhone version", "The same account and contacts", "Chat and voice calls", "Release after iOS testing"],
    },
    es: {
      webName: "Aplicación web", development: "En desarrollo", webCta: "Aplicación web en desarrollo",
      webFeatures: ["Sin instalar programas", "La misma cuenta y contactos", "Chats, llamadas y ajustes", "Instalable como PWA"],
      androidCta: "Descargar APK para Android", iosLabel: "En preparación", iosCta: "Versión para iOS en preparación",
      iosFeatures: ["Preparamos la versión para iPhone", "La misma cuenta y contactos", "Chats y llamadas de voz", "Publicación después de las pruebas en iOS"],
    },
    fr: {
      webName: "Application web", development: "En développement", webCta: "Application web en développement",
      webFeatures: ["Aucun logiciel à installer", "Le même compte et les mêmes contacts", "Discussions, appels et paramètres", "Installation possible en PWA"],
      androidCta: "Télécharger l’APK Android", iosLabel: "En préparation", iosCta: "Version iOS en préparation",
      iosFeatures: ["Nous préparons la version iPhone", "Le même compte et les mêmes contacts", "Discussions et appels vocaux", "Publication après les tests iOS"],
    },
  };
  const localCopy = pricingCopy[lang] || pricingCopy.en;

  const plans = [
    {
      name: localCopy.webName,
      label: localCopy.development,
      cta: localCopy.webCta,
      features: localCopy.webFeatures,
      popular: false,
      testid: "pricing-web",
      disabled: true,
      icon: Globe2,
    },
    {
      name: t("pricing.free"),
      label: version ? `APK ${version}` : "APK latest",
      cta: localCopy.androidCta,
      features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3"), t("pricing.freeF4")],
      popular: false,
      testid: "pricing-android",
      href: apkUrl,
      icon: Download,
    },
    {
      name: "iOS",
      label: localCopy.iosLabel,
      cta: localCopy.iosCta,
      features: localCopy.iosFeatures,
      popular: false,
      testid: "pricing-ios",
      disabled: true,
      icon: Smartphone,
    },
    {
      name: lang === "pl" ? "Wersja desktopowa" : lang === "de" ? "Desktop-App" : "Desktop app",
      label: lang === "pl" ? "W budowie" : lang === "de" ? "In Entwicklung" : "In development",
      cta: lang === "pl" ? "Wersja Windows w budowie" : lang === "de" ? "Windows-App in Entwicklung" : "Windows app in development",
      features: lang === "pl"
        ? ["Osobna aplikacja na komputer", "To samo konto i rozmowy", "Skrót na pulpicie i w menu Start", "Automatyczne połączenie z ghostel.app"]
        : lang === "de"
        ? ["Eigenständige Desktop-App", "Dasselbe Konto und dieselben Unterhaltungen", "Verknüpfungen auf Desktop und im Startmenü", "Automatische Verbindung mit ghostel.app"]
        : ["Standalone desktop application", "The same account and conversations", "Desktop and Start menu shortcuts", "Automatic connection to ghostel.app"],
      popular: false,
      testid: "pricing-desktop",
      disabled: true,
      icon: MonitorDown,
    },
  ];

  return (
    <section id="download" data-testid="download-section" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
            {lang === "pl" ? "Pobieranie" : lang === "de" ? "Herunterladen" : "Download"}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {lang === "pl" ? "Korzystaj tak, jak Ci wygodnie" : lang === "de" ? "Nutze ghostel.app auf deine Art" : "Use ghostel.app your way"}
          </h2>
          <p className="text-base text-zinc-400">
            {lang === "pl"
              ? "Pobierz aplikację na Androida. Wersje iOS, Web i Windows są obecnie w przygotowaniu."
              : lang === "de"
              ? "Lade die Android-App herunter. Die iOS-, Web- und Windows-Versionen befinden sich derzeit in Vorbereitung."
              : "Download the Android app. iOS, Web and Windows versions are currently in preparation."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              data-testid={p.testid}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                p.popular
                  ? "surface border-cyan-400/40 cyan-glow-soft"
                  : "surface surface-hover"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-400 text-[#0a0e14]">
                  {t("pricing.popular")}
                </div>
              )}
              <div className="font-display text-xl font-bold text-white mb-2">{p.name}</div>
              <div className="mb-7 min-h-[58px] flex items-center">
                <span className="font-display text-3xl font-extrabold text-white">{p.label}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" />
                    {f}
                  </li>
                ))}
              </ul>

              {p.disabled ? (
                <Button
                  data-testid={`${p.testid}-cta`}
                  disabled
                  className="w-full h-11 rounded-full bg-white/[0.03] text-zinc-500 border border-white/10"
                >
                  {p.icon ? <p.icon className="w-4 h-4 mr-2" /> : null}
                  {p.cta}
                </Button>
              ) : p.href ? (
                <a
                  href={p.href}
                  data-testid={`${p.testid}-cta`}
                  className={cn(
                    buttonVariants(),
                    "w-full bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 h-11 rounded-full",
                  )}
                >
                  {p.icon ? <p.icon className="w-4 h-4 mr-2" /> : null}
                  {p.cta}
                </a>
              ) : (
                <Button
                  data-testid={`${p.testid}-cta`}
                  onClick={p.onClick}
                  className="w-full btn-cyan h-11 rounded-full"
                >
                  {p.icon ? <p.icon className="w-4 h-4 mr-2" /> : null}
                  {p.cta}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
