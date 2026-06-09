import { useCallback, useEffect, useState } from "react";
import api, { API, formatApiError, buildExportUrl } from "@/lib/api";
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MoreVertical, Search, Download, Eye, Trash2, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const statusColor = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blocked: "bg-red-500/10 text-red-400 border-red-500/20",
};
const roleColor = {
  admin: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  moderator: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  user: "bg-white/5 text-zinc-400 border-white/10",
};

export default function Users() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/admin/users?q=${encodeURIComponent(q)}`);
      setUsers(r.data);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }, [q]);

  useEffect(() => {
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load]);

  const updateUser = async (id, patch) => {
    try {
      await api.patch(`/admin/users/${id}`, patch);
      toast.success("Zaktualizowano");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Usunąć użytkownika?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Usunięto");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div data-testid="admin-users" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
              {t("admin.users")}
            </h1>
            <SourceBadge source="ghostel" />
          </div>
          <p className="text-sm text-zinc-400">{users.length} użytkowników · źródło: ghostel.app API</p>
        </div>
        <a
          data-testid="export-users-csv"
          href={buildExportUrl("users")}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-full glass text-sm text-zinc-200 hover:text-cyan-400 hover:border-cyan-400/40"
        >
          <Download className="w-4 h-4" />
          {t("admin.exportCsv")}
        </a>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          data-testid="users-search"
          placeholder={t("common.search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 bg-white/5 border-white/10 text-white h-10 rounded-xl focus-visible:ring-cyan-400"
        />
      </div>

      <div data-testid="users-table" className="glass rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">User</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">{t("common.email")}</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">{t("common.role")}</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">{t("common.status")}</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider">{t("common.createdAt")}</TableHead>
              <TableHead className="text-zinc-500 text-xs uppercase tracking-wider text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.03]" data-testid={`user-row-${u.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30 border border-white/10 grid place-items-center text-xs font-bold text-white">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white font-medium">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-zinc-400">{u.email}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${roleColor[u.role] || roleColor.user}`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${statusColor[u.status] || statusColor.active}`}>
                    {u.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-zinc-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button data-testid={`user-actions-${u.id}`} variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-strong border-white/10 text-white">
                      <DropdownMenuLabel className="text-xs text-zinc-500">{t("common.actions")}</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setDetail(u)} className="cursor-pointer">
                        <Eye className="w-4 h-4 mr-2" />
                        {t("common.view")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => updateUser(u.id, { role: "admin" })} className="cursor-pointer">
                        {t("admin.makeAdmin")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUser(u.id, { role: "moderator" })} className="cursor-pointer">
                        {t("admin.makeModerator")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUser(u.id, { role: "user" })} className="cursor-pointer">
                        {t("admin.makeUser")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      {u.status === "blocked" ? (
                        <DropdownMenuItem onClick={() => updateUser(u.id, { status: "active" })} className="cursor-pointer text-emerald-400">
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          {t("admin.unblock")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => updateUser(u.id, { status: "blocked" })} className="cursor-pointer text-amber-400">
                          <ShieldOff className="w-4 h-4 mr-2" />
                          {t("admin.block")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => deleteUser(u.id)} className="cursor-pointer text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500 py-12">
                  Brak wyników
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="glass-strong border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-display">{detail?.name}</DialogTitle>
            <DialogDescription className="text-zinc-400">{detail?.email}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Rola:</span><span>{detail.role}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Status:</span><span>{detail.status}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Rejestracja:</span><span>{new Date(detail.created_at).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Ostatnia aktywność:</span><span>{detail.last_active ? new Date(detail.last_active).toLocaleString() : "—"}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
