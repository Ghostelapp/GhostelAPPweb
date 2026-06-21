import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/privacy";

const copy = {
  pl: {
    title: "Prywatne statystyki strony",
    body: "Używamy technicznych statystyk strony, żeby mierzyć odsłony, status usług i najczęstsze problemy. Nie zapisujemy pełnego adresu IP.",
    accept: "Akceptuję",
    decline: "Wyłącz",
    privacy: "Polityka prywatności",
  },
  en: {
    title: "Private website analytics",
    body: "We use technical website analytics to measure page views, service status and common issues. We do not store full IP addresses.",
    accept: "Accept",
    decline: "Disable",
    privacy: "Privacy policy",
  },
  de: {
    title: "Private Website-Statistiken",
    body: "Wir nutzen technische Website-Statistiken fuer Seitenaufrufe, Dienststatus und haeufige Probleme. Vollstaendige IP-Adressen werden nicht gespeichert.",
    accept: "Akzeptieren",
    decline: "Deaktivieren",
    privacy: "Datenschutz",
  },
  es: {
    title: "Estadísticas privadas del sitio",
    body: "Usamos estadísticas técnicas para medir las visitas, el estado del servicio y los problemas frecuentes. No guardamos direcciones IP completas.",
    accept: "Aceptar", decline: "Desactivar", privacy: "Política de privacidad",
  },
  fr: {
    title: "Statistiques privées du site",
    body: "Nous utilisons des statistiques techniques pour mesurer les visites, l’état du service et les problèmes fréquents. Nous ne conservons pas les adresses IP complètes.",
    accept: "Accepter", decline: "Désactiver", privacy: "Politique de confidentialité",
  },
};

export default function PrivacyConsent() {
  const { lang } = useLang();
  const location = useLocation();
  const text = copy[lang] || copy.en;
  const [consent, setConsent] = useState(() => getAnalyticsConsent());

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, [location.pathname]);

  if (consent || location.pathname.startsWith("/admin")) return null;

  const choose = (value) => {
    setAnalyticsConsent(value);
    setConsent(value);
  };

  return (
    <div className="fixed bottom-5 left-5 z-[70] w-[calc(100vw-2.5rem)] max-w-md rounded-3xl border border-cyan-400/20 bg-[#071018]/95 p-4 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-bold">{text.title}</div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">{text.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-cyan-300"
            >
              {text.accept}
            </button>
            <button
              type="button"
              onClick={() => choose("declined")}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
            >
              {text.decline}
            </button>
            <Link to="/privacy" className="px-2 py-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200">
              {text.privacy}
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => choose("declined")}
          aria-label="Close analytics notice"
          className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
