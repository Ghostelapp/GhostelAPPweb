import { useEffect, useMemo, useState } from "react";
import api, { downloadExport, formatApiError } from "@/lib/api";
import { AlertTriangle, Bug, Download, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

const sources = ["all", "app", "website", "backend"];
const levels = ["all", "error", "warning", "info"];
const platforms = ["all", "ios", "android", "web", "desktop", "server", "unknown"];

function Badge({ children, tone = "zinc" }) {
  const colors = {
    red: "bg-red-500/10 text-red-300 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    purple: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
    zinc: "bg-white/5 text-zinc-300 border-white/10",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${colors[tone] || colors.zinc}`}>
      {children}
    </span>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-2">{label}</div>
      <div className={`font-display text-3xl font-black tabular-nums ${tone || "text-white"}`}>{value ?? 0}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ErrorLogs() {
  const [filters, setFilters] = useState({ source: "all", level: "all", platform: "all", q: "" });
  const [data, setData] = useState({ items: [], summary: {}, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const params = useMemo(
    () => ({
      source: filters.source,
      level: filters.level,
      platform: filters.platform,
      q: filters.q.trim() || undefined,
      limit: 80,
    }),
    [filters],
  );

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/error-logs", { params });
      setData(response.data);
      if (!selected && response.data.items?.length) setSelected(response.data.items[0]);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const summary = data.summary || {};

  return (
    <div data-testid="admin-error-logs" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">Diagnostics</div>
          <h1 className="font-display text-4xl font-black tracking-tighter text-white mb-1">Error logs</h1>
          <p className="text-sm text-zinc-400">
            Sanitized technical errors from the mobile app, website and backend. Private content, tokens and keys are redacted.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => downloadExport("error-logs").catch((error) => toast.error(formatApiError(error)))}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-cyan-300"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
        <Stat label="Total" value={summary.total} />
        <Stat label="Last 24h" value={summary.last_24h} tone="text-cyan-300" />
        <Stat label="Errors" value={summary.errors} tone="text-red-300" />
        <Stat label="Warnings" value={summary.warnings} tone="text-amber-300" />
        <Stat label="App" value={summary.app} tone="text-fuchsia-300" />
        <Stat label="Website" value={summary.website} tone="text-cyan-300" />
        <Stat label="Backend" value={summary.backend} tone="text-emerald-300" />
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_180px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Search message, route, screen, version or fingerprint"
              className="w-full rounded-xl border border-white/10 bg-zinc-950/70 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400/50"
            />
          </label>
          <select
            value={filters.source}
            onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))}
            className="rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none"
          >
            {sources.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={filters.level}
            onChange={(event) => setFilters((current) => ({ ...current, level: event.target.value }))}
            className="rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none"
          >
            {levels.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={filters.platform}
            onChange={(event) => setFilters((current) => ({ ...current, platform: event.target.value }))}
            className="rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none"
          >
            {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-cyan-300" />
            <h2 className="font-display text-lg font-bold text-white">Recent logs</h2>
            <span className="ml-auto text-xs text-zinc-500">{data.total || 0} matching</span>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-6 text-sm text-zinc-500">Loading logs...</div>
            ) : data.items?.length ? (
              data.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`block w-full text-left px-5 py-4 transition hover:bg-white/[0.03] ${selected?.id === item.id ? "bg-cyan-400/5" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge tone={item.level === "error" ? "red" : item.level === "warning" ? "amber" : "cyan"}>{item.level}</Badge>
                    <Badge tone={item.source === "app" ? "purple" : item.source === "website" ? "cyan" : "zinc"}>{item.source}</Badge>
                    <Badge>{item.platform}</Badge>
                    {item.app_version ? <span className="text-xs text-zinc-500">v{item.app_version}</span> : null}
                    <span className="ml-auto text-xs text-zinc-500">{formatDate(item.created_at)}</span>
                  </div>
                  <div className="text-sm font-semibold text-white line-clamp-2">{item.message}</div>
                  <div className="mt-1 text-xs text-zinc-500 truncate">
                    {item.route || item.screen || "No route"} - {item.fingerprint}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-sm text-zinc-500">No error logs match the current filters.</div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="h-4 w-4 text-fuchsia-300" />
              <h2 className="font-display text-lg font-bold text-white">Selected log</h2>
            </div>
            {selected ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={selected.level === "error" ? "red" : selected.level === "warning" ? "amber" : "cyan"}>{selected.level}</Badge>
                  <Badge tone={selected.source === "app" ? "purple" : selected.source === "website" ? "cyan" : "zinc"}>{selected.source}</Badge>
                  <Badge>{selected.platform}</Badge>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1">Message</div>
                  <p className="text-sm text-zinc-100 whitespace-pre-wrap break-words">{selected.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-zinc-500">Created</span><div className="text-zinc-200">{formatDate(selected.created_at)}</div></div>
                  <div><span className="text-zinc-500">Version</span><div className="text-zinc-200">{selected.app_version || "-"}</div></div>
                  <div><span className="text-zinc-500">Route</span><div className="text-zinc-200 break-words">{selected.route || "-"}</div></div>
                  <div><span className="text-zinc-500">Screen</span><div className="text-zinc-200 break-words">{selected.screen || "-"}</div></div>
                  <div className="col-span-2"><span className="text-zinc-500">Fingerprint</span><div className="font-mono text-zinc-200 break-all">{selected.fingerprint}</div></div>
                </div>
                {selected.stack ? (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1">Stack</div>
                    <pre className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-300 whitespace-pre-wrap break-words">
                      {selected.stack}
                    </pre>
                  </div>
                ) : null}
                {selected.context ? (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1">Context</div>
                    <pre className="max-h-60 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-300 whitespace-pre-wrap break-words">
                      {JSON.stringify(selected.context, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-zinc-500">Select a log entry.</div>
            )}
          </div>

          <div className="surface rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 mb-4">Top fingerprints</h3>
            <div className="space-y-3">
              {summary.top_fingerprints?.length ? (
                summary.top_fingerprints.map((row) => (
                  <button
                    type="button"
                    key={row.fingerprint}
                    onClick={() => setFilters((current) => ({ ...current, q: row.fingerprint }))}
                    className="block w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-black text-cyan-300">{row.count}</span>
                      <span className="font-mono text-[11px] text-zinc-500 truncate">{row.fingerprint}</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-zinc-400">{row.message}</div>
                  </button>
                ))
              ) : (
                <div className="text-xs text-zinc-600">No repeated fingerprints yet.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
