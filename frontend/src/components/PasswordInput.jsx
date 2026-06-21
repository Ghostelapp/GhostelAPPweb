import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLang } from "@/context/LanguageContext";

export default function PasswordInput({ className = "", ...props }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const label = visible ? t("common.hidePassword") : t("common.showPassword");

  return (
    <div className="relative mt-2">
      <Input {...props} type={visible ? "text" : "password"} className={`${className} mt-0 pr-12`} />
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-zinc-500 transition hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
