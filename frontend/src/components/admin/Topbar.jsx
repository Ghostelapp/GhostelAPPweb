import { useAuth } from "@/context/AuthContext";
import { nextLanguage, useLang } from "@/context/LanguageContext";
import { Globe, LogOut, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();

  return (
    <header
      data-testid="admin-topbar"
      className="sticky top-0 z-30 h-16 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl flex items-center gap-4 px-6"
    >
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          data-testid="topbar-search"
          placeholder={t("common.search")}
          className="pl-9 h-9 bg-white/5 border-white/10 text-sm rounded-xl focus-visible:ring-cyan-400"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => setLang(nextLanguage(lang))}
          data-testid="topbar-lang-toggle"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-semibold text-zinc-300 hover:text-cyan-400"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang.toUpperCase()}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="topbar-user-menu" className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 grid place-items-center text-xs font-bold text-zinc-950">
                {user?.name?.[0] || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-none">{user?.name}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{user?.role}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-strong border-white/10 text-white" align="end">
            <DropdownMenuItem disabled className="text-xs text-zinc-400">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              data-testid="topbar-logout"
              onClick={logout}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
