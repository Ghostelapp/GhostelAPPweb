import { useState } from "react";
import { motion } from "framer-motion";
import { Bitcoin, Check, Copy, HeartHandshake } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const BTC_ADDRESS = "bc1qpqq6j9wtysxr2lmwyxwxgsnm69heusvs99r6zs";

export default function SupportProject() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(BTC_ADDRESS);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section data-testid="support-project-section" className="relative py-20 sm:py-24 border-t divider-soft">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(247,147,26,0.08),transparent_55%)] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-7 sm:p-10 border border-amber-400/20 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 mb-4">
                <HeartHandshake className="w-4 h-4" />
                {t("support.eyebrow")}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                {t("support.title")}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                {t("support.description")}
              </p>
            </div>

            <div className="lg:w-[430px] surface rounded-2xl p-5 border-amber-400/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span className="w-9 h-9 rounded-full bg-amber-400/10 text-amber-400 grid place-items-center">
                  <Bitcoin className="w-5 h-5" />
                </span>
                {t("support.walletLabel")}
              </div>
              <code className="block p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-zinc-300 break-all select-all">
                {BTC_ADDRESS}
              </code>
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={copyAddress}
                  data-testid="support-copy-btc"
                  className="h-10 rounded-full border border-amber-400/25 bg-amber-400/10 hover:bg-amber-400/15 text-amber-300 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t("support.copied") : t("support.copy")}
                </button>
                <a
                  href={`bitcoin:${BTC_ADDRESS}`}
                  data-testid="support-open-wallet"
                  className="h-10 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-zinc-200 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Bitcoin className="w-4 h-4" />
                  {t("support.openWallet")}
                </a>
              </div>
              <p className="text-[11px] text-zinc-600 mt-3">{t("support.note")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
