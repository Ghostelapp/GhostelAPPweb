import { useEffect, useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, RefreshCcw } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { GHOSTEL_MOBILE_API_URL, GHOSTEL_PANEL_API_URL } from "@/lib/constants";

const services = [
  { key: "website", name: "ghostel.app website", url: "https://ghostel.app", type: "head" },
  { key: "app_api", name: "Mobile app API", url: `${GHOSTEL_MOBILE_API_URL}/api/`, type: "json" },
  { key: "panel_api", name: "Website panel API", url: `${GHOSTEL_PANEL_API_URL}/api/`, type: "json" },
];

async function checkService(service) {
  const started = performance.now();
  const response = await fetch(service.url, {
    method: service.type === "head" ? "HEAD" : "GET",
    cache: "no-store",
  });
  return {
    ...service,
    ok: response.ok,
    status: response.status,
    latency: Math.round(performance.now() - started),
  };
}

export default function Status() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState(null);

  const load = async () => {
    setLoading(true);
    const results = await Promise.all(
      services.map((service) =>
        checkService(service).catch((error) => ({
          ...service,
          ok: false,
          status: "error",
          latency: null,
          error: error?.message || "Unavailable",
        }))
      )
    );
    setRows(results);
    setCheckedAt(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const allOk = rows.length > 0 && rows.every((row) => row.ok);

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
            Live check for the public website, mobile API and website admin API.
          </p>
        </div>

        <div className={`mb-6 rounded-3xl border p-6 ${allOk ? "border-emerald-400/20 bg-emerald-400/10" : "border-amber-400/20 bg-amber-400/10"}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {allOk ? <CheckCircle2 className="h-7 w-7 text-emerald-300" /> : <AlertTriangle className="h-7 w-7 text-amber-300" />}
              <div>
                <div className="font-display text-2xl font-bold">
                  {loading ? "Checking services..." : allOk ? "All checked services operational" : "Some services need attention"}
                </div>
                <div className="text-sm text-zinc-400">
                  {checkedAt ? `Last checked: ${checkedAt.toLocaleString()}` : "No check yet"}
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
        </div>

        <div className="grid gap-4">
          {rows.map((row) => (
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
                  {row.latency != null && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                      {row.latency} ms
                    </span>
                  )}
                </div>
              </div>
              {row.error && <div className="mt-3 text-sm text-red-300">{row.error}</div>}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
