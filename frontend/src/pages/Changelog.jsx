import { CalendarDays, CheckCircle2, Smartphone, Wrench } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { GHOSTEL_ANDROID_VERSION } from "@/lib/constants";

const updates = [
  {
    version: GHOSTEL_ANDROID_VERSION,
    date: "2026-06-26",
    title: "Cross-device call control and louder audio",
    items: [
      "Added silent call-control push so other devices stop ringing after a call is accepted or ended.",
      "Kept Android full-screen call notifications in sync even when the app is locked or backgrounded.",
      "Started mobile voice calls on speaker by default for louder conversation audio.",
      "Published Android build 28 and iOS build 24 as version 1.4.28.",
    ],
  },
  {
    version: "1.4.26",
    date: "2026-06-22",
    title: "Cross-platform call acceptance",
    items: [
      "Stopped Android ringback immediately when an iPhone accepts the call.",
      "Persisted call acceptance so temporary WebSocket disconnects do not lose the event.",
      "Stopped duplicate ringing on other devices signed into the callee account.",
      "Published Android build 26 and iOS build 22 as version 1.4.26.",
    ],
  },
  {
    version: "1.4.23",
    date: "2026-06-20",
    title: "Mobile lock-screen call stability",
    items: [
      "Started the Android microphone foreground service before WebRTC connects.",
      "Restored active incoming calls after Android and iOS unlock transitions.",
      "Re-applied mobile audio routing and ICE recovery when the app resumes.",
      "Published Android build 23 and iOS build 19 as version 1.4.23.",
    ],
  },
  {
    version: "1.4.17",
    date: "2026-06-18",
    title: "Support, diagnostics and device controls",
    items: [
      "Added in-app voice call diagnostics.",
      "Added push device management and old-device removal.",
      "Added in-app bug reports routed to Ghostel Support.",
      "Added website status page, changelog and mini support widget.",
    ],
  },
  {
    version: "1.4.16",
    date: "2026-06-16",
    title: "Android release update",
    items: [
      "Updated public Android download on ghostel.app.",
      "Improved website download links and release metadata.",
    ],
  },
  {
    version: "1.4.x",
    date: "2026-06",
    title: "Calls and notifications stabilization",
    items: [
      "Improved incoming-call push payloads.",
      "Added registered push devices visibility.",
      "Improved call notification channel handling on Android.",
    ],
  },
];

export default function Changelog() {
  return (
    <div className="min-h-screen bg-[#070a0f] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-28 lg:px-8">
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            <Wrench className="h-4 w-4" />
            Changelog
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
            Ghostel updates
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Public release notes for Android, iOS preparation, website and admin panel changes.
          </p>
        </div>

        <div className="relative space-y-5">
          {updates.map((update) => (
            <article key={`${update.version}-${update.date}`} className="glass rounded-3xl p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-cyan-300">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">Version {update.version}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold">{update.title}</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {update.date}
                </div>
              </div>
              <ul className="space-y-3">
                {update.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
