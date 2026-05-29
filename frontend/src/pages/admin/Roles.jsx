import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import SourceBadge from "@/components/admin/SourceBadge";
import { Button } from "@/components/ui/button";
import { Shield, KeyRound, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

const roles = [
  { id: "admin", label: "Administrator", icon: Shield, color: "fuchsia", desc: "Pełny dostęp do panelu" },
  { id: "moderator", label: "Moderator", icon: KeyRound, color: "cyan", desc: "Zarządzanie treścią i zgłoszeniami" },
  { id: "user", label: "Użytkownik", icon: UserIcon, color: "zinc", desc: "Standardowy dostęp" },
];

export default function Roles() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const r = await api.get("/admin/users");
      setUsers(r.data);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}`, { role });
      toast.success("Rola zaktualizowana");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div data-testid="admin-roles" className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            {t("admin.roles")}
          </h1>
          <SourceBadge source="ghostel" />
        </div>
        <p className="text-sm text-zinc-400">Role z Ghostel API · zmiany roli aktualnie read-only.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {roles.map((r) => {
          const count = users.filter((u) => u.role === r.id).length;
          const Icon = r.icon;
          return (
            <div key={r.id} data-testid={`role-card-${r.id}`} className="glass rounded-2xl p-6">
              <div className={`w-10 h-10 rounded-xl mb-4 grid place-items-center ${
                r.color === "fuchsia" ? "bg-fuchsia-500/10 text-fuchsia-400" :
                r.color === "cyan" ? "bg-cyan-500/10 text-cyan-400" : "bg-white/5 text-zinc-300"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">{r.label}</h3>
              <p className="text-xs text-zinc-400 mb-3">{r.desc}</p>
              <div className="font-display text-3xl font-black neon-text">{count}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">użytkowników</div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-white mb-4">Lista użytkowników</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30 border border-white/10 grid place-items-center text-xs font-bold text-white">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{u.name}</div>
                <div className="text-xs text-zinc-500 truncate">{u.email}</div>
              </div>
              <div className="flex gap-1">
                {roles.map((r) => (
                  <Button
                    key={r.id}
                    data-testid={`assign-role-${r.id}-${u.id}`}
                    size="sm"
                    onClick={() => setRole(u.id, r.id)}
                    className={`text-[10px] uppercase font-bold h-7 px-3 ${
                      u.role === r.id
                        ? "bg-cyan-400 text-zinc-950"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {r.id}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
