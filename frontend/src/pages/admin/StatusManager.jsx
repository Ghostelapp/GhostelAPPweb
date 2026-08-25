import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

const services = ["general", "website", "mobile_api", "panel_api", "push", "calls", "turn", "apk"];
const statuses = ["investigating", "identified", "monitoring", "resolved"];
const impacts = ["none", "minor", "major", "critical"];

const emptyForm = {
  service: "general",
  title: "",
  message: "",
  status: "investigating",
  impact: "minor",
  public: true,
};

function Badge({ children, tone = "zinc" }) {
  const colors = {
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    red: "border-red-400/20 bg-red-400/10 text-red-300",
    zinc: "border-white/10 bg-white/5 text-zinc-300",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${colors[tone] || colors.zinc}`}>
      {children}
    </span>
  );
}

function fieldClass() {
  return "mt-2 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50";
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function toneForIncident(item) {
  if (item.status === "resolved" || item.impact === "none") return "green";
  if (item.impact === "critical" || item.impact === "major") return "red";
  if (item.impact === "minor") return "amber";
  return "cyan";
}

export default function StatusManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/status-incidents");
      setItems(response.data?.items || []);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/status-incidents", form);
      toast.success("Incident saved");
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const patchIncident = async (item, patch) => {
    try {
      await api.patch(`/admin/status-incidents/${item.id}`, patch);
      toast.success("Incident updated");
      await load();
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const removeIncident = async (item) => {
    if (!window.confirm(`Delete incident "${item.title}"?`)) return;
    try {
      await api.delete(`/admin/status-incidents/${item.id}`);
      toast.success("Incident deleted");
      await load();
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const openCount = items.filter((item) => item.status !== "resolved").length;
  const publicCount = items.filter((item) => item.public).length;

  return (
    <div data-testid="admin-status-manager" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Status Manager</div>
          <h1 className="font-display mb-1 text-4xl font-black tracking-tighter text-white">Public incidents</h1>
          <p className="max-w-3xl text-sm text-zinc-400">
            Manage incident history shown on the public status page. Keep messages operational and avoid private user data.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="surface rounded-2xl p-5">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Open incidents</div>
          <div className={`font-display text-3xl font-black ${openCount ? "text-amber-300" : "text-emerald-300"}`}>{openCount}</div>
        </div>
        <div className="surface rounded-2xl p-5">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Public records</div>
          <div className="font-display text-3xl font-black text-cyan-300">{publicCount}</div>
        </div>
        <div className="surface rounded-2xl p-5">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Total records</div>
          <div className="font-display text-3xl font-black text-white">{items.length}</div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={save} className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
            <h2 className="font-display text-xl font-bold text-white">Create incident</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Service
                <select className={fieldClass()} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                  {services.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Impact
                <select className={fieldClass()} value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}>
                  {impacts.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Status
              <select className={fieldClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Title
              <input className={fieldClass()} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Public message
              <textarea
                className={`${fieldClass()} min-h-[140px]`}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Short operational note. Do not include private user data, tokens or logs."
              />
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">
              <input type="checkbox" checked={form.public} onChange={(e) => setForm({ ...form, public: e.target.checked })} />
              Visible on public status page
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-cyan-300 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save incident"}
            </button>
          </div>
        </form>

        <section className="glass rounded-2xl overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-display text-xl font-bold text-white">Incident history</h2>
            <p className="mt-1 text-xs text-zinc-500">Public items are shown on /status. Resolved incidents remain visible as history.</p>
          </div>
          <div className="divide-y divide-white/5">
            {items.length ? items.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone="cyan">{item.service}</Badge>
                      <Badge tone={toneForIncident(item)}>{item.status}</Badge>
                      <Badge tone={toneForIncident(item)}>{item.impact}</Badge>
                      {item.public ? <Badge>public</Badge> : <Badge tone="amber">hidden</Badge>}
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                    <div className="mt-1 text-xs text-zinc-500">updated {formatDate(item.updated_at)}</div>
                    {item.message ? <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-400">{item.message}</p> : null}
                    {item.resolved_at ? <div className="mt-2 text-xs text-emerald-300">resolved {formatDate(item.resolved_at)}</div> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {item.status !== "resolved" ? (
                      <button
                        type="button"
                        onClick={() => patchIncident(item, { status: "resolved", impact: "none" })}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/20"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => patchIncident(item, { public: !item.public })}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10"
                    >
                      {item.public ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {item.public ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeIncident(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-400/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-sm text-zinc-500">No incidents yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
