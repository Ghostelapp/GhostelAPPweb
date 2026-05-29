import { motion } from "framer-motion";
import { MessageCircle, Phone, Users, Bell } from "lucide-react";

const fakeChats = [
  { name: "Marek", text: "Hej, jesteś?", time: "12:34", unread: 2, color: "from-cyan-400 to-blue-500" },
  { name: "Design Team", text: "Nowy mockup ready 🎨", time: "12:30", unread: 5, color: "from-fuchsia-500 to-purple-500" },
  { name: "Anna", text: "Wysłałam pliki", time: "12:15", unread: 0, color: "from-emerald-400 to-teal-500" },
  { name: "Crypto Talk", text: "BTC pump!", time: "11:58", unread: 12, color: "from-amber-400 to-orange-500" },
];

export default function PhoneMockup() {
  return (
    <div className="relative w-[300px] sm:w-[340px] animate-floaty">
      {/* Glow */}
      <div className="absolute -inset-8 bg-gradient-to-br from-cyan-500/30 via-fuchsia-500/20 to-purple-600/30 blur-3xl opacity-60" />

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] p-2 bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-2xl">
        <div className="rounded-[2.2rem] bg-zinc-950 overflow-hidden border border-white/5">
          {/* Notch */}
          <div className="relative h-7 flex justify-center items-end pb-1">
            <div className="w-24 h-5 bg-black rounded-b-2xl flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            </div>
          </div>

          {/* Status bar */}
          <div className="px-5 py-2 flex justify-between text-[10px] text-zinc-300 font-medium">
            <span>9:41</span>
            <span>Ghostel</span>
            <span>100%</span>
          </div>

          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-white/5">
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Czaty
              </div>
              <div className="font-display text-lg font-bold text-white">
                Wiadomości
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 grid place-items-center text-xs font-bold text-zinc-950">
              GH
            </div>
          </div>

          {/* Chat list */}
          <div className="px-3 py-2 space-y-1 min-h-[280px]">
            {fakeChats.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.color} grid place-items-center text-xs font-bold text-zinc-950`}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-white font-medium truncate">{c.name}</span>
                    <span className="text-[10px] text-zinc-500">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 truncate">{c.text}</span>
                    {c.unread > 0 && (
                      <span className="ml-2 text-[10px] font-bold bg-cyan-400 text-zinc-950 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="border-t border-white/5 px-2 py-3 flex justify-around">
            {[MessageCircle, Phone, Users, Bell].map((Icon, i) => (
              <div
                key={i}
                className={`w-9 h-9 grid place-items-center rounded-lg ${i === 0 ? "text-cyan-400 bg-cyan-400/10" : "text-zinc-500"}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute -left-6 top-12 glass-strong rounded-2xl px-4 py-3 shadow-2xl hidden sm:flex items-center gap-3 max-w-[220px]"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 grid place-items-center">
          <Bell className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-white">Nowa wiadomość</div>
          <div className="text-[10px] text-zinc-400">Push w czasie rzeczywistym</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -right-6 bottom-24 glass-strong rounded-2xl px-3 py-2.5 shadow-2xl hidden sm:flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-400/20 grid place-items-center">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-white">Połączenie</div>
          <div className="text-[10px] text-zinc-400">02:14</div>
        </div>
      </motion.div>
    </div>
  );
}
