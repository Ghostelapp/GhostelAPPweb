import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function NoAccess() {
  const { t } = useLang();
  return (
    <div data-testid="no-access" className="min-h-screen grid place-items-center bg-zinc-950 p-6">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative glass-strong rounded-3xl p-10 max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 grid place-items-center mb-5">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-black text-white mb-3">
          {t("admin.noAccess")}
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          Tylko administratorzy mogą wejść do tej sekcji.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 font-semibold rounded-full px-6">
            ← Strona główna
          </Button>
        </Link>
      </div>
    </div>
  );
}
