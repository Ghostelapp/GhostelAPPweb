import { CalendarDays, CheckCircle2, Smartphone, Wrench } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { GHOSTEL_ANDROID_VERSION } from "@/lib/constants";

const updates = [
  {
    version: GHOSTEL_ANDROID_VERSION,
    date: "2026-10-27",
    title: "Calls and account security update",
    items: [
      "Improved incoming-call recovery and call lifecycle handling across iOS and Android.",
      "Strengthened website session renewal with HttpOnly cookies.",
      "Published Android build 63 as version 1.4.56 and submitted iOS build 75 to TestFlight.",
      "Updated public tester metadata and Android download versioning.",
    ],
  },
  {
    version: GHOSTEL_ANDROID_VERSION,
    date: "2026-09-07",
    title: "Android and iOS release 1.4.55",
    items: [
      "Published Android build 62 as version 1.4.55 for tester APK downloads.",
      "Submitted iOS build 67 as version 1.4.55 to App Store Connect/TestFlight processing.",
      "Fixed backend import errors that broke login and media uploads.",
      "Updated ghostel.app download links and SEO metadata.",
    ],
  },
  {
    version: "1.4.54",
    date: "2026-08-26",
    title: "Fresh Android and iOS test builds",
    items: [
      "Published Android build 58 as version 1.4.54 for tester APK downloads.",
      "Submitted iOS build 61 as version 1.4.54 to App Store Connect/TestFlight processing.",
      "Updated ghostel.app tester links and release metadata so mobile browsers do not reuse the stale APK link.",
    ],
  },
  {
    version: GHOSTEL_ANDROID_VERSION,
    date: "2026-07-05",
    title: "Accepted-call signaling recovery",
    items: [
      "Recovered caller-side WebRTC offer negotiation after iOS and Android accepted-call events.",
      "Prevented no-answer timeout from ending calls after the callee already accepted.",
      "Kept iOS call-control cleanup on VoIP PushKit and Android call-control cleanup on FCM to reduce duplicate call notifications.",
      "Published Android build 54 as version 1.4.54 and kept iOS testing metadata visible in the admin panel.",
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
