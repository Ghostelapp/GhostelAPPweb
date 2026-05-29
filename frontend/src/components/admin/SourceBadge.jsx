import { Info } from "lucide-react";

/**
 * Badge marking sections backed by mock/local data
 * since the upstream Ghostel API does not expose these endpoints yet.
 */
export default function SourceBadge({ source = "local", className = "" }) {
  if (source === "ghostel") {
    return (
      <span
        data-testid="badge-source-ghostel"
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-soft" />
        LIVE · Ghostel API
      </span>
    );
  }
  return (
    <span
      data-testid="badge-source-local"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}
    >
      <Info className="w-3 h-3" />
      Local mock
    </span>
  );
}
