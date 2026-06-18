import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LifeBuoy, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";

const copy = {
  pl: {
    label: "Support",
    title: "Potrzebujesz pomocy?",
    subtitle: "Napisz do Ghostel Support",
    name: "Imie",
    email: "Email",
    subject: "Temat",
    message: "Opis problemu",
    send: "Wyslij",
    full: "Pelny formularz",
    success: "Zgloszenie przyjete",
  },
  en: {
    label: "Support",
    title: "Need help?",
    subtitle: "Contact Ghostel Support",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Issue description",
    send: "Send",
    full: "Full form",
    success: "Support request received",
  },
  de: {
    label: "Support",
    title: "Brauchst du Hilfe?",
    subtitle: "Ghostel Support kontaktieren",
    name: "Name",
    email: "E-Mail",
    subject: "Betreff",
    message: "Problembeschreibung",
    send: "Senden",
    full: "Vollstaendiges Formular",
    success: "Support-Anfrage erhalten",
  },
};

export default function FloatingSupport() {
  const { lang } = useLang();
  const location = useLocation();
  const text = copy[lang] || copy.en;
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  if (location.pathname.startsWith("/admin")) return null;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const response = await api.post("/contact", {
        ...form,
        category: "technical",
        app_platform: "unknown",
        app_version: "",
      });
      toast.success(response.data?.ticket_id ? `${text.success}: ${response.data.ticket_id}` : text.success);
      setForm({ name: "", email: "", subject: "", message: "" });
      setOpen(false);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="floating-support-widget" className="fixed bottom-5 right-5 z-[60]">
      {open && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-3xl border border-cyan-400/25 bg-[#071018]/95 p-4 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{text.label}</div>
              <div className="mt-1 font-display text-lg font-bold">{text.title}</div>
              <div className="text-xs text-zinc-400">{text.subtitle}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Close support"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              required
              minLength={2}
              maxLength={120}
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder={text.name}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-zinc-500 focus:border-cyan-400/50"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder={text.email}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-zinc-500 focus:border-cyan-400/50"
            />
            <input
              required
              minLength={4}
              maxLength={160}
              value={form.subject}
              onChange={(event) => update("subject", event.target.value)}
              placeholder={text.subject}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-zinc-500 focus:border-cyan-400/50"
            />
            <textarea
              required
              minLength={20}
              maxLength={5000}
              value={form.message}
              onChange={(event) => update("message", event.target.value)}
              placeholder={text.message}
              className="min-h-[110px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-cyan-400/50"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-sm font-bold text-zinc-950 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "..." : text.send}
              </button>
              <Link to="/contact" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-white/5">
                {text.full}
              </Link>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        data-testid="floating-support-button"
        aria-label={text.subtitle}
        className="group ml-auto flex items-center gap-3 rounded-2xl border border-cyan-400/25 bg-[#071018]/90 px-4 py-3 text-left text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-[#0a1420]"
      >
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-zinc-950">
          {open ? <X className="h-5 w-5" /> : <LifeBuoy className="hidden h-5 w-5 sm:block" />}
          {!open && <MessageCircle className="h-5 w-5 sm:hidden" />}
        </div>
        <div className="hidden pr-1 sm:block">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{text.label}</div>
          <div className="text-sm font-semibold text-white">{text.title}</div>
          <div className="text-xs text-zinc-400">{text.subtitle}</div>
        </div>
      </button>
    </div>
  );
}
