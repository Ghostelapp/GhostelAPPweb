import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Inbox, LifeBuoy, RefreshCcw, Save, Search } from "lucide-react";
import api, { downloadExport, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "waiting", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const categoryOptions = [
  { value: "account", label: "Account" },
  { value: "technical", label: "Technical" },
  { value: "billing", label: "Billing" },
  { value: "security", label: "Security" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
];

function pillClass(type, value) {
  if (type === "priority") {
    if (value === "urgent") return "bg-red-500/10 text-red-300 border-red-500/20";
    if (value === "high") return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    if (value === "low") return "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";
    return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
  }
  if (value === "resolved" || value === "closed") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (value === "waiting") return "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20";
  if (value === "open") return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
  return "bg-amber-500/10 text-amber-300 border-amber-500/20";
}

function Pill({ type, value }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${pillClass(type, value)}`}>
      {value}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function Support() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    q: "",
  });
  const [draft, setDraft] = useState({
    status: "new",
    priority: "normal",
    assigned_to: "",
    admin_note: "",
  });

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId || item.public_id === selectedId) || items[0],
    [items, selectedId]
  );

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params[key] = value;
      });
      const response = await api.get("/admin/support", { params });
      setItems(response.data.items || []);
      setSummary(response.data.summary || {});
      if (!selectedId && response.data.items?.length) {
        setSelectedId(response.data.items[0].id);
      }
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

  useEffect(() => {
    if (!selected) return;
    setDraft({
      status: selected.status || "new",
      priority: selected.priority || "normal",
      assigned_to: selected.assigned_to || "",
      admin_note: selected.admin_note || "",
    });
  }, [selected]);

  const applyFilters = (event) => {
    event.preventDefault();
    load();
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await api.patch(`/admin/support/${selected.id}`, draft);
      setItems((current) => current.map((item) => (item.id === selected.id ? response.data : item)));
      toast.success("Support ticket updated");
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: "Total", value: summary.total || 0 },
    { label: "New", value: summary.new || 0 },
    { label: "Open", value: summary.open || 0 },
    { label: "Resolved", value: summary.resolved || 0 },
    { label: "High", value: (summary.high || 0) + (summary.urgent || 0) },
  ];

  return (
    <div data-testid="admin-support" className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-display text-4xl font-black tracking-tighter text-white">
              Contact Support
            </h1>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-300">
              Website
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Manage contact requests from ghostel.app, assign ownership, and keep status history.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={load}
            className="border border-white/10 text-zinc-200 hover:bg-white/5"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            type="button"
            onClick={() => downloadExport("support").catch((error) => toast.error(formatApiError(error)))}
            className="btn-cyan"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{card.label}</div>
            <div className="mt-2 font-display text-3xl font-black text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <form onSubmit={applyFilters} className="glass rounded-2xl p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Search id, email, subject, message"
              className="border-white/10 bg-white/5 pl-9 text-white"
            />
          </div>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/10 text-white">
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
            <SelectTrigger className="border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/10 text-white">
              <SelectItem value="all">All priorities</SelectItem>
              {priorityOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger className="border-white/10 bg-white/5 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/10 text-white">
              <SelectItem value="all">All categories</SelectItem>
              {categoryOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading} className="btn-cyan">
            Apply
          </Button>
        </div>
      </form>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="glass rounded-2xl p-4">
          <div className="mb-4 flex items-center gap-2 text-cyan-300">
            <Inbox className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.15em]">Tickets</span>
          </div>
          <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selected?.id === item.id
                    ? "border-cyan-400/30 bg-cyan-400/10"
                    : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-cyan-300">{item.public_id}</div>
                    <div className="mt-1 line-clamp-1 font-semibold text-white">{item.subject}</div>
                  </div>
                  <Pill type="priority" value={item.priority} />
                </div>
                <div className="mb-3 line-clamp-2 text-xs leading-5 text-zinc-400">{item.message}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill type="status" value={item.status} />
                  <span className="text-[11px] text-zinc-500">{item.email}</span>
                  <span className="text-[11px] text-zinc-600">{formatDate(item.created_at)}</span>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="py-16 text-center text-sm text-zinc-500">
                No support tickets match current filters.
              </div>
            )}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          {selected ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-fuchsia-300">
                    <LifeBuoy className="h-4 w-4" />
                    <span className="font-mono text-xs">{selected.public_id}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">{selected.subject}</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {selected.name} - {selected.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Pill type="status" value={selected.status} />
                  <Pill type="priority" value={selected.priority} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Message</div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{selected.message}</p>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Category</div>
                  <div className="mt-1 text-white">{selected.category}</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Platform</div>
                  <div className="mt-1 text-white">{selected.app_platform || "unknown"} {selected.app_version ? `v${selected.app_version}` : ""}</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Created</div>
                  <div className="mt-1 text-white">{formatDate(selected.created_at)}</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Updated</div>
                  <div className="mt-1 text-white">{formatDate(selected.updated_at)}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-zinc-400">Status</Label>
                  <Select value={draft.status} onValueChange={(value) => setDraft({ ...draft, status: value })}>
                    <SelectTrigger className="mt-2 border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/10 text-white">
                      {statusOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-zinc-400">Priority</Label>
                  <Select value={draft.priority} onValueChange={(value) => setDraft({ ...draft, priority: value })}>
                    <SelectTrigger className="mt-2 border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/10 text-white">
                      {priorityOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-400">Assigned to</Label>
                <Input
                  value={draft.assigned_to}
                  onChange={(e) => setDraft({ ...draft, assigned_to: e.target.value })}
                  placeholder="admin@ghostel.app"
                  className="mt-2 border-white/10 bg-white/5 text-white"
                />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-400">Internal note</Label>
                <Textarea
                  value={draft.admin_note}
                  onChange={(e) => setDraft({ ...draft, admin_note: e.target.value })}
                  className="mt-2 min-h-[120px] border-white/10 bg-white/5 text-white"
                  placeholder="Visible only in admin panel"
                />
              </div>

              <Button onClick={save} disabled={saving} className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-semibold text-zinc-950">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save changes"}
              </Button>

              <div>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">History</div>
                <div className="space-y-2">
                  {(selected.history || []).slice().reverse().map((entry, index) => (
                    <div key={`${entry.at}-${index}`} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-zinc-400">
                      <div className="mb-1 flex justify-between gap-3 text-zinc-300">
                        <span>{entry.actor}</span>
                        <span>{formatDate(entry.at)}</span>
                      </div>
                      <div>{entry.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-sm text-zinc-500">
              Select a support ticket to manage it.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
