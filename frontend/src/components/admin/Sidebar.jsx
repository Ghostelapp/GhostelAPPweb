import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Shield,
  Bell,
  KeyRound,
  Settings,
  FileBarChart2,
  Home,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import BrandLogo from "@/components/BrandLogo";
import BrandMark from "@/components/BrandMark";

export default function Sidebar() {
  const { t } = useLang();
  const navigate = useNavigate();

  const items = [
    { to: "/admin", icon: LayoutDashboard, label: t("admin.dashboard"), end: true, testid: "sidebar-dashboard" },
    { to: "/admin/users", icon: Users, label: t("admin.users"), testid: "sidebar-users" },
    { to: "/admin/groups", icon: UsersRound, label: t("admin.groups"), testid: "sidebar-groups" },
    { to: "/admin/moderation", icon: Shield, label: t("admin.moderation"), testid: "sidebar-moderation" },
    { to: "/admin/notifications", icon: Bell, label: t("admin.notifications"), testid: "sidebar-notifications" },
    { to: "/admin/roles", icon: KeyRound, label: t("admin.roles"), testid: "sidebar-roles" },
    { to: "/admin/settings", icon: Settings, label: t("admin.settings"), testid: "sidebar-settings" },
    { to: "/admin/reports", icon: FileBarChart2, label: t("admin.reports"), testid: "sidebar-reports" },
  ];

  return (
    <aside
      data-testid="admin-sidebar"
      className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 border-r divider-soft bg-[#0a0e14] z-40"
    >
      <div className="px-6 py-6 flex items-center gap-3 border-b divider-soft">
        <BrandLogo className="h-10 w-10" />
        <div>
          <BrandMark className="text-sm leading-none" />
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] mt-1.5">
            Admin panel
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={it.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-white border border-transparent"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t divider-soft">
        <button
          onClick={() => navigate("/")}
          data-testid="sidebar-back-home"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-white/[0.03] hover:text-white"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
      </div>
    </aside>
  );
}
