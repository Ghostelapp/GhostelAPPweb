import { useLang } from "@/context/LanguageContext";
import { Github, Twitter, Linkedin, ShieldCheck } from "lucide-react";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer data-testid="footer-section" className="relative border-t divider-soft pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/30 grid place-items-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-white">Ghostel</span>
            </div>
            <p className="text-sm text-zinc-400 mb-6 max-w-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-2">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  data-testid={`footer-social-${i}`}
                  className="w-9 h-9 rounded-lg surface surface-hover grid place-items-center text-zinc-400 hover:text-cyan-400 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 mb-4">
              Ghostel
            </div>
            <ul className="space-y-3 text-sm">
              <li><a href="#" data-testid="footer-link-about" className="text-zinc-400 hover:text-cyan-400">{t("footer.about")}</a></li>
              <li><a href="#" data-testid="footer-link-contact" className="text-zinc-400 hover:text-cyan-400">{t("footer.contact")}</a></li>
              <li><a href="#" data-testid="footer-link-download" className="text-zinc-400 hover:text-cyan-400">{t("footer.download")}</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 mb-4">
              Legal
            </div>
            <ul className="space-y-3 text-sm">
              <li><a href="#" data-testid="footer-link-terms" className="text-zinc-400 hover:text-cyan-400">{t("footer.terms")}</a></li>
              <li><a href="#" data-testid="footer-link-privacy" className="text-zinc-400 hover:text-cyan-400">{t("footer.privacy")}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t divider-soft text-xs text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© 2026 Ghostel. {t("footer.rights")}</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            TLS 1.3 · E2EE
          </div>
        </div>
      </div>
    </footer>
  );
}
