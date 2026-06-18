import { useEffect, useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, RefreshCcw, Clock3 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { GHOSTEL_PANEL_API_URL } from "@/lib/constants";

const statusCopy = {
  operational: {
    label: "All checked services operational",
    className: "border-emerald-400/20 bg-emerald-400/10",
    icon: "text-emerald-300",
  },
  degraded: {
    label: "Some services need attention",
    className: "border-amber-400/20 bg-amber-400/10",
    icon: "text-amber-300",
  },
  outage: {
    label: "Major service outage",
    className: "border-red-400/20 bg-red-400/10",
    icon: "text-red-300",
  },
};

function formatTime(value) {
  if (!value) return "No check yet";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function Status() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${GHOSTEL_PANEL_API_URL}/api/status`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Status API returned HTTP ${response.status}`);
      setData(await response.json());
    } catch (err) {
      setError(err?.message || "Status API unavailable");
      setData({
        overall_status: "degraded",
        generated_at: new Date().toISOString(),
        services: [],
        incidents: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const overall = data?.overall_status || "degraded";
  const copy = statusCopy[overall] || statusCopy.degraded;
  const services = data?.services || [];
  const incidents = data?.incidents || [];

  return (
    <div className="min-h-screen bg-[#070a0f] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-28 lg:px-8">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            <Activity className="h-4 w-4" />
            System status
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
            Ghostel service status
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Server-side status for the public website, mobile API and website panel API.
          </p>
        </div>

        <div className={`mb-6 rounded-3xl border p-6 ${copy.className}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {overall === "operational" ? (
                <CheckCircle2 className={`h-7 w-7 ${copy.icon}`} />
              ) : (
                <AlertTriangle className={`h-7 w-7 ${copy.icon}`} />
              )}
              <div>
                <div className="font-display text-2xl font-bold">
                  {loading ? "Checking services..." : copy.label}
                </div>
                <div className="text-sm text-zinc-400">
                  Last checked: {formatTime(data?.generated_at)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:bg-white/5 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          {error && <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}
        </div>

        <div className="grid gap-4">
          {services.map((row) => (
            <div key={row.key} className="glass rounded-2xl p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-display text-xl font-bold">{row.name}</div>
                  <div className="mt-1 break-all text-sm text-zinc-500">{row.url}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${row.ok ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-red-400/20 bg-red-400/10 text-red-300"}`}>
                    {row.ok ? "Operational" : "Issue"}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                    HTTP {row.status}
                  </span>
                  {row.latency_ms != null && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                      {row.latency_ms} ms
                    </span>
                  )}
                </div>
              </div>
              {row.error && <div className="mt-3 text-sm text-red-300">{row.error}</div>}
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-cyan-300" />
            <h2 className="font-display text-2xl font-bold">Incident history</h2>
          </div>
          {incidents.length === 0 ? (
            <p className="text-sm text-zinc-400">No public incidents reported.</p>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id || incident.title} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-semibold text-white">{incident.title}</div>
                    <div className="text-xs text-zinc-500">{formatTime(incident.updated_at)}</div>
                  </div>
                  {incident.message && <p className="mt-2 text-sm text-zinc-400">{incident.message}</p>}
                  {incident.status && (
                    <span className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-zinc-400">
                      {incident.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
