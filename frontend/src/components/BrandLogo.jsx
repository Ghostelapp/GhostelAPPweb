export default function BrandLogo({ className = "h-9 w-9", rounded = "rounded-xl" }) {
  return (
    <img
      src="/ghostel-logo.png"
      alt="ghostel.app"
      className={`${className} ${rounded} object-cover shadow-[0_0_24px_rgba(34,211,238,0.18)]`}
      loading="eager"
      decoding="async"
    />
  );
}
