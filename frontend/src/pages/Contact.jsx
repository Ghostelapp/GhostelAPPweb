import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, ShieldCheck, Clock3, Send, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const copy = {
  pl: {
    eyebrow: "Contact support",
    title: "Skontaktuj się z pomocą Ghostel",
    intro: "Opisz problem możliwie konkretnie. Zgłoszenie trafi do panelu administracyjnego i będzie obsługiwane przez zespół Ghostel.",
    name: "Imię lub nazwa",
    email: "Email do odpowiedzi",
    category: "Kategoria",
    platform: "Platforma",
    version: "Wersja aplikacji",
    subject: "Temat",
    message: "Opis problemu",
    submit: "Wyślij zgłoszenie",
    sending: "Wysyłanie...",
    successTitle: "Zgłoszenie zostało przyjęte",
    ticket: "Numer zgłoszenia",
    backHome: "Wróć na stronę główną",
    response: "Zwykle odpowiadamy w 24-48 godzin.",
    security: "Nie wysyłaj haseł, kodów SMS ani prywatnych kluczy.",
    direct: "Pilne sprawy: support@ghostel.app",
  },
  en: {
    eyebrow: "Contact support",
    title: "Contact Ghostel Support",
    intro: "Describe the issue clearly. Your ticket will be stored in the admin panel and handled by the Ghostel team.",
    name: "Name",
    email: "Reply email",
    category: "Category",
    platform: "Platform",
    version: "App version",
    subject: "Subject",
    message: "Issue description",
    submit: "Send request",
    sending: "Sending...",
    successTitle: "Support request received",
    ticket: "Ticket ID",
    backHome: "Back to homepage",
    response: "We usually reply within 24-48 hours.",
    security: "Do not send passwords, SMS codes, or private keys.",
    direct: "Urgent cases: support@ghostel.app",
  },
  de: {
    eyebrow: "Contact support",
    title: "Ghostel Support kontaktieren",
    intro: "Beschreibe das Problem konkret. Dein Ticket wird im Admin-Panel gespeichert und vom Ghostel-Team bearbeitet.",
    name: "Name",
    email: "Antwort-E-Mail",
    category: "Kategorie",
    platform: "Plattform",
    version: "App-Version",
    subject: "Betreff",
    message: "Problembeschreibung",
    submit: "Anfrage senden",
    sending: "Senden...",
    successTitle: "Support-Anfrage erhalten",
    ticket: "Ticket-ID",
    backHome: "Zur Startseite",
    response: "Wir antworten normalerweise innerhalb von 24-48 Stunden.",
    security: "Sende keine Passwoerter, SMS-Codes oder privaten Schluessel.",
    direct: "Dringende Faelle: support@ghostel.app",
  },
  es: {
    eyebrow: "Soporte", title: "Contacta con el soporte de Ghostel",
    intro: "Describe el problema con claridad. La solicitud se guardará en el panel de administración y será atendida por el equipo de Ghostel.",
    name: "Nombre", email: "Correo para la respuesta", category: "Categoría", platform: "Plataforma",
    version: "Versión de la aplicación", subject: "Asunto", message: "Descripción del problema",
    submit: "Enviar solicitud", sending: "Enviando...", successTitle: "Solicitud de soporte recibida",
    ticket: "Número de solicitud", backHome: "Volver al inicio", response: "Normalmente respondemos en 24-48 horas.",
    security: "No envíes contraseñas, códigos SMS ni claves privadas.", direct: "Casos urgentes: support@ghostel.app",
  },
  fr: {
    eyebrow: "Assistance", title: "Contactez l’assistance Ghostel",
    intro: "Décrivez clairement le problème. La demande sera enregistrée dans le panneau d’administration et traitée par l’équipe Ghostel.",
    name: "Nom", email: "Adresse e-mail de réponse", category: "Catégorie", platform: "Plateforme",
    version: "Version de l’application", subject: "Objet", message: "Description du problème",
    submit: "Envoyer la demande", sending: "Envoi...", successTitle: "Demande d’assistance reçue",
    ticket: "Numéro de demande", backHome: "Retour à l’accueil", response: "Nous répondons généralement sous 24 à 48 heures.",
    security: "N’envoyez pas de mots de passe, de codes SMS ni de clés privées.", direct: "Demandes urgentes : support@ghostel.app",
  },
};

const categories = [
  { value: "account", label: "Account" },
  { value: "technical", label: "Technical issue" },
  { value: "billing", label: "Billing" },
  { value: "security", label: "Security / privacy" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
];

const platforms = [
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "web", label: "Web" },
  { value: "desktop", label: "Desktop" },
  { value: "unknown", label: "Not sure" },
];

export default function Contact() {
  const { lang } = useLang();
  const text = copy[lang] || copy.en;
  const [sent, setSent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "technical",
    app_platform: "android",
    app_version: "",
    subject: "",
    message: "",
    website: "",
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/contact", {
        ...form,
        submitted_after_ms: Math.max(0, Date.now() - startedAt),
      });
      setSent(response.data);
      toast.success(text.successTitle);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-white">
      <Navbar />
      <main className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                <Mail className="h-4 w-4" />
                {text.eyebrow}
              </div>
              <div>
                <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
                  {text.title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
                  {text.intro}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="glass rounded-2xl p-5">
                  <Clock3 className="mb-3 h-5 w-5 text-cyan-300" />
                  <p className="text-sm text-zinc-300">{text.response}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <ShieldCheck className="mb-3 h-5 w-5 text-fuchsia-300" />
                  <p className="text-sm text-zinc-300">{text.security}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <Mail className="mb-3 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-zinc-300">{text.direct}</p>
                </div>
              </div>
            </section>

            <section className="glass rounded-3xl p-6 sm:p-8">
              {sent ? (
                <div data-testid="contact-success" className="py-10 text-center">
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="font-display text-3xl font-bold">{text.successTitle}</h2>
                  <p className="mt-3 text-sm text-zinc-400">{text.ticket}</p>
                  <div className="mx-auto mt-3 inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 font-mono text-cyan-200">
                    {sent.ticket_id}
                  </div>
                  <div className="mt-8">
                    <Button asChild className="btn-cyan rounded-xl px-6">
                      <Link to="/">{text.backHome}</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form data-testid="contact-support-form" onSubmit={submit} className="space-y-5">
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    name="website"
                    className="hidden"
                    aria-hidden="true"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-zinc-400">{text.name}</Label>
                      <Input
                        required
                        minLength={2}
                        maxLength={120}
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="mt-2 border-white/10 bg-white/5 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-zinc-400">{text.email}</Label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="mt-2 border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-zinc-400">{text.category}</Label>
                      <Select value={form.category} onValueChange={(value) => update("category", value)}>
                        <SelectTrigger className="mt-2 border-white/10 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-white/10 text-white">
                          {categories.map((item) => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-zinc-400">{text.platform}</Label>
                      <Select value={form.app_platform} onValueChange={(value) => update("app_platform", value)}>
                        <SelectTrigger className="mt-2 border-white/10 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-white/10 text-white">
                          {platforms.map((item) => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-zinc-400">{text.version}</Label>
                      <Input
                        maxLength={40}
                        placeholder="1.0.0"
                        value={form.app_version}
                        onChange={(e) => update("app_version", e.target.value)}
                        className="mt-2 border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-zinc-400">{text.subject}</Label>
                    <Input
                      required
                      minLength={4}
                      maxLength={160}
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className="mt-2 border-white/10 bg-white/5 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-zinc-400">{text.message}</Label>
                    <Textarea
                      required
                      minLength={20}
                      maxLength={5000}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      className="mt-2 min-h-[180px] border-white/10 bg-white/5 text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-semibold text-zinc-950 hover:opacity-95"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? text.sending : text.submit}
                  </Button>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
