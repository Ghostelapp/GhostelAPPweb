import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Send, Megaphone } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Notifications() {
  const { t } = useLang();
  const [history, setHistory] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    icon: "bell",
    link: "",
    target_type: "all",
    target_id: "",
  });
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const [hr, gr, ur] = await Promise.all([
        api.get("/admin/notifications"),
        api.get("/admin/groups"),
        api.get("/admin/users"),
      ]);
      setHistory(hr.data);
      setGroups(gr.data);
      setUsers(ur.data);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (!form.title || !form.body) return toast.error("Wypełnij tytuł i treść");
    setSending(true);
    try {
      const payload = { ...form };
      if (payload.target_type === "all") payload.target_id = null;
      await api.post("/admin/notifications", payload);
      toast.success("Powiadomienie wysłane");
      setForm({ ...form, title: "", body: "", link: "" });
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="admin-notifications" className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black tracking-tighter text-white mb-1">
          {t("admin.notifications")}
        </h1>
        <p className="text-sm text-zinc-400">{t("admin.sendNotification")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div data-testid="notification-form" className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Megaphone className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.15em]">Compose</span>
          </div>
          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.target")}</Label>
            <Select value={form.target_type} onValueChange={(v) => setForm({ ...form, target_type: v, target_id: "" })}>
              <SelectTrigger data-testid="notif-target-type" className="mt-2 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10 text-white">
                <SelectItem value="all">{t("admin.targetAll")}</SelectItem>
                <SelectItem value="group">{t("admin.targetGroup")}</SelectItem>
                <SelectItem value="user">{t("admin.targetUser")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.target_type === "group" && (
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Grupa</Label>
              <Select value={form.target_id} onValueChange={(v) => setForm({ ...form, target_id: v })}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Wybierz grupę" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10 text-white max-h-72">
                  {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.target_type === "user" && (
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Użytkownik</Label>
              <Select value={form.target_id} onValueChange={(v) => setForm({ ...form, target_id: v })}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Wybierz użytkownika" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10 text-white max-h-72">
                  {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} · {u.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.title")}</Label>
            <Input
              data-testid="notif-title-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.body")}</Label>
            <Textarea
              data-testid="notif-body-input"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.icon")}</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white"
                placeholder="bell"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.link")}</Label>
              <Input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white"
                placeholder="/inbox"
              />
            </div>
          </div>

          <Button
            data-testid="notif-send-btn"
            onClick={send}
            disabled={sending}
            className="w-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 font-semibold rounded-xl h-11"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "..." : t("admin.send")}
          </Button>
        </div>

        <div data-testid="notification-history" className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 text-fuchsia-400 mb-4">
            <Bell className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.15em]">{t("admin.history")}</span>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {history.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="text-sm font-semibold text-white">{n.title}</div>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mb-2 line-clamp-2">{n.body}</div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold uppercase">
                    {n.target_type}
                  </span>
                  <span>{n.recipients} odbiorców</span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center text-zinc-500 text-sm py-12">Brak wysłanych powiadomień</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
