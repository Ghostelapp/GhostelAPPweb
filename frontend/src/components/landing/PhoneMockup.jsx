import { motion } from "framer-motion";
import { Lock, Timer, ShieldCheck, Phone } from "lucide-react";

const fakeChats = [
  { name: "Legal Team", text: "NDA draft · 24h timer", time: "12:34", unread: 2 },
  { name: "M&A Workspace", text: "Disappearing in 1h 12m", time: "12:30", unread: 5 },
  { name: "CISO direct", text: "E2EE call ended · 14:02", time: "12:15", unread: 0 },
  { name: "Board · Q1", text: "Audit log exported", time: "11:58", unread: 1 },
];

export default function PhoneMockup() {
  return (
    <div className="relative w-[300px] sm:w-[330px] animate-floaty">
      {/* soft glow */}
      <div className="absolute -inset-6 bg-cyan-500/10 blur-3xl rounded-[3rem]" />

      {/* Phone frame */}
      <div className="relative rounded-[2.3rem] p-[3px] bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="rounded-[2.1rem] bg-[#0a0e14] overflow-hidden border border-white/5">
          {/* Notch */}
          <div className="relative h-7 flex justify-center items-end pb-1">
            <div className="w-24 h-5 bg-black rounded-b-2xl" />
          </div>

          {/* Welcome screen + chat list combo */}
          <div className="px-5 pt-2 pb-3 flex justify-between text-[10px] text-zinc-400 font-medium">
            <span>9:41</span>
            <span className="flex items-center gap-1 text-cyan-400">
              <Lock className="w-2.5 h-2.5" /> E2EE
            </span>
            <span>100%</span>
          </div>

          {/* Brand row */}
          <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/30 grid place-items-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display text-base font-bold text-white leading-none">Ghostel</div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.15em] mt-1">
                Private. Encrypted.
              </div>
            </div>
          </div>

          {/* Chat list */}
          <div className="px-3 py-3 space-y-0.5 min-h-[270px]">
            {fakeChats.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.03]"
              >
                <div className="w-9 h-9 rounded-full bg-[#1a2030] border border-white/5 grid place-items-center text-cyan-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-white font-medium truncate">{c.name}</span>
                    <span className="text-[10px] text-zinc-500">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 truncate">{c.text}</span>
                    {c.unread > 0 && (
                      <span className="ml-2 text-[10px] font-bold bg-cyan-400 text-[#0a0e14] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="border-t border-white/5 px-4 py-3">
            <div className="bg-cyan-400 text-[#0a0e14] rounded-full py-2 text-center text-xs font-bold">
              Get started
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute -left-6 top-20 surface rounded-2xl px-3.5 py-2.5 shadow-2xl hidden sm:flex items-center gap-2.5 max-w-[200px]"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 grid place-items-center text-cyan-400">
          <Timer className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-white leading-tight">Znika za 23h</div>
          <div className="text-[10px] text-zinc-500">Disappearing</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="absolute -right-4 bottom-32 surface rounded-2xl px-3 py-2.5 shadow-2xl hidden sm:flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-cyan-400/10 grid place-items-center">
          <Phone className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-white leading-tight">E2EE call</div>
          <div className="text-[10px] text-zinc-500">02:14</div>
        </div>
      </motion.div>
    </div>
  );
}
