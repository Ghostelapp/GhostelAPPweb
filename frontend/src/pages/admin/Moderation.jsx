import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import SourceBadge from "@/components/admin/SourceBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, X, Ban, MessageSquare, User, UsersRound } from "lucide-react";
import { toast } from "sonner";

const typeIcon = { message: MessageSquare, user: User, group: UsersRound };

export default function Moderation() {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState("all");

  const load = async () => {
    try {
      const r = await api.get("/admin/reports");
      setReports(r.data);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (id, act) => {
    try {
      await api.post(`/admin/reports/${id}/action`, { action: act });
      toast.success("Wykonano");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const filtered = tab === "all" ? reports : reports.filter((r) => r.type === tab);

  return (
    <div data-testid="admin-moderation" className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            {t("admin.moderation")}
          </h1>
          <SourceBadge source="local" />
        </div>
        <p className="text-sm text-zinc-400">{reports.length} zgłoszeń · {reports.filter(r=>r.status==='pending').length} oczekujących</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all" data-testid="moderation-tab-all">Wszystkie</TabsTrigger>
          <TabsTrigger value="message" data-testid="moderation-tab-messages">Wiadomości</TabsTrigger>
          <TabsTrigger value="user" data-testid="moderation-tab-users">Użytkownicy</TabsTrigger>
          <TabsTrigger value="group" data-testid="moderation-tab-groups">Grupy</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 space-y-3">
          {filtered.map((r) => {
            const Icon = typeIcon[r.type] || MessageSquare;
            return (
              <div
                key={r.id}
                data-testid={`report-${r.id}`}
                className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 grid place-items-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{r.type}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      r.status === "pending"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : r.status === "blocked"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium">{r.target}</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Powód: <span className="text-zinc-300">{r.reason}</span> · zgłoszone przez <span className="text-zinc-300">{r.reporter}</span> · {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      data-testid={`report-accept-${r.id}`}
                      size="sm"
                      onClick={() => action(r.id, "accept")}
                      className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      {t("admin.accept")}
                    </Button>
                    <Button
                      data-testid={`report-reject-${r.id}`}
                      size="sm"
                      onClick={() => action(r.id, "reject")}
                      className="bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      {t("admin.reject")}
                    </Button>
                    <Button
                      data-testid={`report-block-${r.id}`}
                      size="sm"
                      onClick={() => action(r.id, "block")}
                      className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      {t("admin.blockUser")}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center text-zinc-500 text-sm">Brak zgłoszeń</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
