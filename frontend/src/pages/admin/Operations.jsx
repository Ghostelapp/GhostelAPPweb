import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe2,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

function Badge({ children, tone = "zinc" }) {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
    red: "bg-red-500/10 text-red-300 border-red-400/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-400/20",
    cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    zinc: "bg-white/5 text-zinc-300 border-white/10",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${colors[tone] || colors.zinc}`}>
      {children}
    </span>
  );
}

function Stat({ icon: Icon, label, value, tone = "text-white" }) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={`font-display text-3xl font-black tabular-nums ${tone}`}>{value ?? "-"}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  const displayValue = value === 0 || value ? value : "-";
  return (
    <div className="grid gap-1 border-b border-white/5 py-3 last:border-0 md:grid-cols-[190px_1fr]">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className={`min-w-0 break-words text-sm text-zinc-200 ${mono ? "font-mono" : ""}`}>{displayValue}</div>
    </div>
  );
}

function BoolRow({ label, value }) {
  return (
    <InfoRow
      label={label}
      value={<Badge tone={value ? "green" : "amber"}>{value ? "enabled" : "not configured"}</Badge>}
    />
  );
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return value || "-";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function ServiceCard({ service }) {
  const ok = Boolean(service.ok);
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
          {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-white">{service.name}</h3>
            <Badge tone={ok ? "green" : "red"}>{ok ? "ok" : "failed"}</Badge>
          </div>
          <a
            href={service.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-zinc-500 hover:text-cyan-300"
          >
            <span className="truncate">{service.url}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-zinc-500">Method</div>
          <div className="mt-1 font-semibold text-zinc-200">{service.method || "-"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-zinc-500">Status</div>
          <div className="mt-1 font-semibold text-zinc-200">{service.status || "-"}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-zinc-500">Latency</div>
          <div className="mt-1 font-semibold text-zinc-200">{service.latency_ms ?? "-"} ms</div>
        </div>
      </div>
      {service.error ? (
        <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-200">
          {service.error}
        </div>
      ) : null}
    </div>
  );
}

export default function Operations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/operations");
      setData(response.data);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = data?.summary || {};
  const counts = data?.counts || {};
  const android = data?.builds?.android || {};
  const website = data?.builds?.website || {};
  const config = data?.configuration || {};
  const serviceOkText = `${summary.healthy_services ?? 0}/${summary.total_services ?? 0}`;

  const stats = useMemo(
    () => [
      { icon: Activity, label: "Services OK", value: serviceOkText, tone: summary.overall_status === "operational" ? "text-emerald-300" : "text-amber-300" },
      { icon: AlertTriangle, label: "Errors 24h", value: counts.errors_24h ?? 0, tone: counts.errors_24h ? "text-amber-300" : "text-emerald-300" },
      { icon: ShieldCheck, label: "Open support", value: counts.support_open ?? 0, tone: counts.support_urgent ? "text-red-300" : "text-white" },
      { icon: Smartphone, label: "APK version", value: android.release_center_version || android.header_version || android.query_version || "-", tone: "text-cyan-300" },
      { icon: Globe2, label: "Website active", value: counts.website_active_now ?? 0, tone: "text-fuchsia-300" },
    ],
    [android.header_version, android.query_version, android.release_center_version, counts.errors_24h, counts.support_open, counts.support_urgent, counts.website_active_now, serviceOkText, summary.overall_status],
  );

  if (!data && loading) {
    return <div className="text-sm text-zinc-500">Loading operations...</div>;
  }

  return (
    <div data-testid="admin-operations" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Operations</div>
          <h1 className="font-display mb-1 text-4xl font-black tracking-tighter text-white">System operations</h1>
          <p className="max-w-3xl text-sm text-zinc-400">
            Read-only operational checks for releases, APK download, public services and support queues.
            Secrets, tokens, message contents and private app data are not exposed here.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((item) => (
          <Stat key={item.label} {...item} />
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-cyan-300" />
          <h2 className="font-display text-xl font-bold text-white">Service health</h2>
          <Badge tone={summary.overall_status === "operational" ? "green" : summary.overall_status === "outage" ? "red" : "amber"}>
            {summary.overall_status || "unknown"}
          </Badge>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {(data?.services || []).map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-cyan-300" />
            <h2 className="font-display text-xl font-bold text-white">Android release</h2>
          </div>
          <InfoRow label="APK URL" value={android.apk_url} mono />
          <InfoRow label="Release Center" value={android.release_center_version ? `${android.release_center_version} (${android.release_center_build || "-"})` : "-"} />
          <InfoRow label="URL version" value={android.query_version} />
          <InfoRow label="Header version" value={android.header_version} />
          <InfoRow label="File size" value={formatBytes(android.content_length)} />
          <InfoRow label="Content type" value={android.content_type} />
          <InfoRow label="File name" value={android.content_disposition} />
          <InfoRow label="Cache policy" value={android.cache_control} />
          <InfoRow label="Last modified" value={android.last_modified} />
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-fuchsia-300" />
            <h2 className="font-display text-xl font-bold text-white">Website build</h2>
            <Badge tone={website.ok ? "green" : "amber"}>{website.ok ? "manifest ok" : "check failed"}</Badge>
          </div>
          <InfoRow label="Manifest URL" value={website.url} mono />
          <InfoRow label="Status" value={website.status} />
          <InfoRow label="Latency" value={website.latency_ms !== null && website.latency_ms !== undefined ? `${website.latency_ms} ms` : "-"} />
          <InfoRow label="Main JS" value={website.main_js} mono />
          <InfoRow label="Main CSS" value={website.main_css} mono />
          {website.error ? <InfoRow label="Error" value={website.error} /> : null}
          {website.entrypoints?.length ? (
            <div className="pt-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Entrypoints</div>
              <div className="space-y-2">
                {website.entrypoints.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-zinc-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
            <h2 className="font-display text-xl font-bold text-white">Queues and diagnostics</h2>
          </div>
          <InfoRow label="Support open" value={counts.support_open} />
          <InfoRow label="Support urgent" value={counts.support_urgent} />
          <InfoRow label="Support unassigned" value={counts.support_unassigned} />
          <InfoRow label="Bug reports pending" value={counts.bug_pending} />
          <InfoRow label="Bug reports accepted" value={counts.bug_accepted} />
          <InfoRow label="Errors last 24h" value={counts.errors_24h} />
          <InfoRow label="Generated at" value={formatDate(data?.generated_at)} />
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <h2 className="font-display text-xl font-bold text-white">Safe configuration</h2>
          </div>
          <BoolRow label="Public app API" value={config.ghostel_public_api_configured} />
          <BoolRow label="Admin API bridge" value={config.ghostel_admin_bridge_configured} />
          <BoolRow label="Secure cookies" value={config.secure_cookies_enabled} />
          <BoolRow label="Error redaction" value={config.error_log_redaction_enabled} />
          <InfoRow label="Frontend URL" value={config.frontend_url} mono />
          <InfoRow label="Website URL" value={config.public_website_url} mono />
          <InfoRow label="Mobile API URL" value={config.mobile_api_url} mono />
          <InfoRow label="Panel API URL" value={config.panel_api_url} mono />
          <InfoRow label="Release API URL" value={config.release_api_url} mono />
        </section>
      </div>
    </div>
  );
}
