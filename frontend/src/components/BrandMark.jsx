export default function BrandMark({ className = "", accentClassName = "text-cyan-400" }) {
  return (
    <span
      aria-label="ghostel.app"
      className={`inline-flex items-baseline whitespace-nowrap font-mono font-bold tracking-[-0.06em] ${className}`}
    >
      <span aria-hidden="true" className={accentClassName}>&lt;</span>
      <span className="text-white">ghostel.app</span>
      <span aria-hidden="true" className={accentClassName}>/&gt;</span>
    </span>
  );
}
