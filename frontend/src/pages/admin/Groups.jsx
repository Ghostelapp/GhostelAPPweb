import { useCallback, useEffect, useState } from "react";
import api, { formatApiError, downloadExport } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import SourceBadge from "@/components/admin/SourceBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, Download, Trash2, Ban, CheckCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function Groups() {
  const { t } = useLang();
  const [groups, setGroups] = useState([]);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", visibility: "public" });

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/admin/groups?q=${encodeURIComponent(q)}`);
      setGroups(r.data);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }, [q]);

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load]);

  const createGroup = async () => {
    if (!form.name.trim()) return;
    try {
      await api.post("/admin/groups", form);
      toast.success("Grupa utworzona");
      setCreating(false);
      setForm({ name: "", description: "", visibility: "public" });
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const updateGroup = async (id, patch) => {
    try {
      await api.patch(`/admin/groups/${id}`, patch);
      toast.success("Zaktualizowano");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const deleteGroup = async (id) => {
    if (!window.confirm("Usunąć grupę?")) return;
    try {
      await api.delete(`/admin/groups/${id}`);
      toast.success("Usunięto");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div data-testid="admin-groups" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
              {t("admin.groups")}
            </h1>
            <SourceBadge source="local" />
          </div>
          <p className="text-sm text-zinc-400">{groups.length} grup · workspace management coming in v1.1</p>
        </div>
        <div className="flex gap-3">
          <button
            data-testid="export-groups-csv"
            type="button"
            onClick={() => downloadExport("groups").catch((e) => toast.error(formatApiError(e)))}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full glass text-sm text-zinc-200 hover:text-cyan-400"
          >
            <Download className="w-4 h-4" />
            {t("admin.exportCsv")}
          </button>
          <Button
            data-testid="create-group-btn"
            onClick={() => setCreating(true)}
            className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 font-semibold rounded-full px-5 hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowa grupa
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          data-testid="groups-search"
          placeholder={t("common.search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 bg-white/5 border-white/10 text-white h-10 rounded-xl"
        />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Nazwa</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Widoczność</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">Członkowie</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">{t("common.status")}</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">{t("common.createdAt")}</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <TableRow key={g.id} data-testid={`group-row-${g.id}`} className="border-white/5 hover:bg-white/[0.03]">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-cyan-400/30 border border-white/10 grid place-items-center text-xs font-bold text-white">
                      #
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">{g.name}</div>
                      <div className="text-xs text-zinc-500">{g.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/10">
                    {g.visibility}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-zinc-300">{g.members_count}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${
                    g.status === "blocked"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {g.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-zinc-500">
                  {g.created_at ? new Date(g.created_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button data-testid={`group-actions-${g.id}`} variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-strong border-white/10 text-white">
                      {g.status === "blocked" ? (
                        <DropdownMenuItem onClick={() => updateGroup(g.id, { status: "active" })} className="cursor-pointer text-emerald-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Odblokuj
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => updateGroup(g.id, { status: "blocked" })} className="cursor-pointer text-amber-400">
                          <Ban className="w-4 h-4 mr-2" />
                          Zablokuj
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => deleteGroup(g.id)} className="cursor-pointer text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500 py-12">Brak grup</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="glass-strong border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-display">Nowa grupa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Nazwa</Label>
              <Input
                data-testid="group-name-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Opis</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">Widoczność</Label>
              <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10 text-white">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreating(false)}>Anuluj</Button>
            <Button
              data-testid="group-create-submit"
              onClick={createGroup}
              className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 font-semibold"
            >
              Utwórz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
