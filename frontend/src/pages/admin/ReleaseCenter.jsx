import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, PackageCheck, RefreshCw, Rocket, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { GHOSTEL_ANDROID_BUILD, GHOSTEL_ANDROID_VERSION, GHOSTEL_APK_URL } from "@/lib/constants";

const emptyForm = {
  platform: "android",
  version: GHOSTEL_ANDROID_VERSION,
  build_number: GHOSTEL_ANDROID_BUILD,
  title: `Android ${GHOSTEL_ANDROID_VERSION}`,
  status: "published",
  download_url: GHOSTEL_APK_URL,
  release_url: "https://github.com/Ghostelapp/app-Gostel/releases/latest",
  commit_sha: "",
  notes: "",
  current: true,
  public: true,
};

const platforms = ["android", "ios", "website", "backend", "desktop"];
const statuses = ["draft", "testing", "published", "rollback"];

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

export default function ReleaseCenter() {
  const [data, setData] = useState({ items: [], current: {} });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/releases");
      setData(response.data || { items: [], current: {} });
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const currentItems = Object.values(data.current || {});

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/releases", form);
      toast.success("Release saved");
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const patchRelease = async (release, patch) => {
    try {
      await api.patch(`/admin/releases/${release.id}`, patch);
      toast.success("Release updated");
      await load();
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const removeRelease = async (release) => {
    if (!window.confirm(`Delete release ${release.platform} ${release.version}?`)) return;
    try {
      await api.delete(`/admin/releases/${release.id}`);
      toast.success("Release deleted");
      await load();
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  return (
    <div data-testid="admin-release-center" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Release Center</div>
          <h1 className="font-display mb-1 text-4xl font-black tracking-tighter text-white">Builds and downloads</h1>
          <p className="max-w-3xl text-sm text-zinc-400">
            One admin-controlled source for current Android, iOS, website, backend and desktop releases.
            Mark exactly one release per platform as current to avoid stale APK links.
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

      <section className="grid gap-4 xl:grid-cols-5">
        {currentItems.map((item) => (
          <div key={item.platform} className="surface rounded-2xl p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <PackageCheck className="h-4 w-4" />
            </div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{item.platform}</div>
            <div className="font-display text-2xl font-black text-white">{item.version || "-"}</div>
            <div className="mt-2 text-xs text-zinc-500">build {item.build_number || "-"}</div>
            <Badge tone={item.source === "default" ? "amber" : "green"}>{item.source || "release_center"}</Badge>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={save} className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-cyan-300" />
            <h2 className="font-display text-xl font-bold text-white">Add release</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Platform
                <select className={fieldClass()} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                  {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Status
                <select className={fieldClass()} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Version
                <input className={fieldClass()} value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} required />
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Build
                <input className={fieldClass()} value={form.build_number} onChange={(e) => setForm({ ...form, build_number: e.target.value })} />
              </label>
            </div>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Title
              <input className={fieldClass()} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Download URL
              <input className={fieldClass()} value={form.download_url} onChange={(e) => setForm({ ...form, download_url: e.target.value })} placeholder="https://..." />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Release URL
              <input className={fieldClass()} value={form.release_url} onChange={(e) => setForm({ ...form, release_url: e.target.value })} placeholder="https://..." />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Commit SHA
              <input className={fieldClass()} value={form.commit_sha} onChange={(e) => setForm({ ...form, commit_sha: e.target.value })} />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Notes
              <textarea className={`${fieldClass()} min-h-[110px]`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">
                <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} />
                Current
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">
                <input type="checkbox" checked={form.public} onChange={(e) => setForm({ ...form, public: e.target.checked })} />
                Public
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-cyan-300 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save release"}
            </button>
          </div>
        </form>

        <section className="glass rounded-2xl overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-display text-xl font-bold text-white">Release history</h2>
            <p className="mt-1 text-xs text-zinc-500">Current releases are exposed through /api/releases/current.</p>
          </div>
          <div className="divide-y divide-white/5">
            {data.items?.length ? data.items.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone="cyan">{item.platform}</Badge>
                      <Badge tone={item.status === "published" ? "green" : item.status === "rollback" ? "red" : "amber"}>{item.status}</Badge>
                      {item.current ? <Badge tone="green">current</Badge> : null}
                      {item.public ? <Badge>public</Badge> : <Badge tone="amber">private</Badge>}
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">{item.title || `${item.platform} ${item.version}`}</h3>
                    <div className="mt-1 text-sm text-zinc-400">v{item.version} · build {item.build_number || "-"} · updated {formatDate(item.updated_at)}</div>
                    {item.download_url ? (
                      <a href={item.download_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs text-cyan-300 hover:text-cyan-200">
                        <span className="truncate">{item.download_url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : null}
                    {item.notes ? <p className="mt-3 line-clamp-3 text-sm text-zinc-400">{item.notes}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!item.current ? (
                      <button
                        type="button"
                        onClick={() => patchRelease(item, { current: true })}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/20"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Set current
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => patchRelease(item, { public: !item.public })}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10"
                    >
                      {item.public ? "Hide" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRelease(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-400/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-sm text-zinc-500">No releases saved yet. The public endpoint still returns the default Android release.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
