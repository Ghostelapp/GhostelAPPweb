import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import SourceBadge from "@/components/admin/SourceBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function Settings() {
  const { t } = useLang();
  const [s, setS] = useState({
    app_name: "ghostel.app",
    logo_url: "",
    primary_color: "#00E5FF",
    secondary_color: "#B026FF",
    terms: "",
    privacy: "",
    maintenance_mode: false,
    max_file_size_mb: 50,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/settings").then((r) => {
      if (r.data && Object.keys(r.data).length) setS((cur) => ({ ...cur, ...r.data }));
    });
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await api.patch("/admin/settings", s);
      toast.success("Zapisano");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-settings" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
              {t("admin.settings")}
            </h1>
            <SourceBadge source="local" />
          </div>
          <p className="text-sm text-zinc-400">Lokalna konfiguracja landing page'a ghostel.app.</p>
        </div>
        <Button
          data-testid="settings-save-btn"
          onClick={save}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 font-semibold rounded-full px-5"
        >
          <Save className="w-4 h-4 mr-2" />
          {t("common.save")}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">Branding</h3>
          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.appName")}</Label>
            <Input
              data-testid="settings-app-name"
              value={s.app_name}
              onChange={(e) => setS({ ...s, app_name: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.logoUrl")}</Label>
            <Input
              value={s.logo_url || ""}
              onChange={(e) => setS({ ...s, logo_url: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.primaryColor")}</Label>
              <div className="mt-2 flex gap-2 items-center">
                <input
                  type="color"
                  value={s.primary_color}
                  onChange={(e) => setS({ ...s, primary_color: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
                />
                <Input
                  value={s.primary_color}
                  onChange={(e) => setS({ ...s, primary_color: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.secondaryColor")}</Label>
              <div className="mt-2 flex gap-2 items-center">
                <input
                  type="color"
                  value={s.secondary_color}
                  onChange={(e) => setS({ ...s, secondary_color: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
                />
                <Input
                  value={s.secondary_color}
                  onChange={(e) => setS({ ...s, secondary_color: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">System</h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <Label className="text-sm text-white font-semibold">{t("admin.maintenance")}</Label>
              <div className="text-xs text-zinc-500">Wyłącza dostęp dla użytkowników</div>
            </div>
            <Switch
              data-testid="settings-maintenance"
              checked={s.maintenance_mode}
              onCheckedChange={(v) => setS({ ...s, maintenance_mode: v })}
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.maxFileSize")}</Label>
            <Input
              data-testid="settings-max-file-size"
              type="number"
              value={s.max_file_size_mb}
              onChange={(e) => setS({ ...s, max_file_size_mb: parseInt(e.target.value || 0, 10) })}
              className="mt-2 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4 md:col-span-2">
          <h3 className="font-display text-lg font-bold text-white">Treści prawne</h3>
          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.termsContent")}</Label>
            <Textarea
              data-testid="settings-terms"
              value={s.terms || ""}
              onChange={(e) => setS({ ...s, terms: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white min-h-[120px]"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 uppercase tracking-wider">{t("admin.privacyContent")}</Label>
            <Textarea
              data-testid="settings-privacy"
              value={s.privacy || ""}
              onChange={(e) => setS({ ...s, privacy: e.target.value })}
              className="mt-2 bg-white/5 border-white/10 text-white min-h-[120px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
