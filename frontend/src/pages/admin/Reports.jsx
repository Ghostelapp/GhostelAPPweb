import { downloadExport, formatApiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { Download, Activity, UserPlus, Flag, UsersRound, LifeBuoy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const reports = [
  { kind: "activity", icon: Activity, title: "Aktywność użytkowników", desc: "Last activity per user.", color: "cyan" },
  { kind: "users", icon: UserPlus, title: "Rejestracje", desc: "Wszyscy użytkownicy z datą rejestracji.", color: "purple" },
  { kind: "reports", icon: Flag, title: "Zgłoszenia", desc: "Pełna historia zgłoszeń.", color: "amber" },
  { kind: "groups", icon: UsersRound, title: "Statystyki grup", desc: "Lista grup z liczbą członków.", color: "cyan" },
  { kind: "support", icon: LifeBuoy, title: "Support", desc: "Zgłoszenia z formularza kontaktowego.", color: "purple" },
  { kind: "error-logs", icon: AlertTriangle, title: "Error logs", desc: "Sanitized app, website and backend error logs.", color: "amber" },
];

export default function Reports() {
  const { t } = useLang();

  return (
    <div data-testid="admin-reports" className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black tracking-tighter text-white mb-1">
          {t("admin.reports")}
        </h1>
        <p className="text-sm text-zinc-400">{t("admin.generateReport")} – eksport do CSV.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.kind}
              data-testid={`report-card-${r.kind}`}
              className="glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${
                  r.color === "cyan" ? "bg-cyan-400/10 text-cyan-400" :
                  r.color === "purple" ? "bg-fuchsia-500/10 text-fuchsia-400" :
                  "bg-amber-500/10 text-amber-400"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-white mb-1">{r.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{r.desc}</p>
                  <button
                    data-testid={`download-${r.kind}-csv`}
                    type="button"
                    onClick={() => downloadExport(r.kind).catch((e) => toast.error(formatApiError(e)))}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t("admin.exportCsv")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-xs text-zinc-500">
          Formaty XLSX / PDF będą dostępne w kolejnej iteracji.
        </p>
      </div>
    </div>
  );
}
