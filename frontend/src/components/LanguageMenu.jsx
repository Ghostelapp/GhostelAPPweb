import { Check, ChevronDown, Globe } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "de", short: "DE", label: "Deutsch" },
  { code: "en", short: "EN", label: "English" },
  { code: "es", short: "ES", label: "Español" },
  { code: "fr", short: "FR", label: "Français" },
  { code: "pl", short: "PL", label: "Polski" },
];

export default function LanguageMenu({ compact = false }) {
  const { lang, setLang } = useLang();
  const current = languages.find((language) => language.code === lang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="language-menu-trigger"
          aria-label="Select language"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
        >
          <Globe className="h-4 w-4 text-cyan-400" />
          <span>{compact ? current.short : current.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[180px] rounded-xl border-white/10 bg-[#0b1016]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            data-testid={`language-option-${language.code}`}
            onClick={() => setLang(language.code)}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 focus:bg-cyan-400/10 focus:text-white"
          >
            <span className="w-7 text-[10px] font-bold tracking-widest text-cyan-400">
              {language.short}
            </span>
            <span className="flex-1 text-sm">{language.label}</span>
            {lang === language.code && <Check className="h-4 w-4 text-cyan-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
