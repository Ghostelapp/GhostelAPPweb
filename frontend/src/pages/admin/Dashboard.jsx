import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import {
  Users,
  MessageSquare,
  UsersRound,
  ShieldAlert,
  Activity,
  Eye,
  Globe2,
  Radio,
  Clock3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, accent, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
    data-testid={`stat-card-${idx}`}
    className="glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all"
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-10 h-10 rounded-xl grid place-items-center ${
          accent === "cyan"
            ? "bg-cyan-400/10 text-cyan-400"
            : accent === "purple"
            ? "bg-fuchsia-500/10 text-fuchsia-400"
            : accent === "emerald"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">
      {label}
    </div>
    <div className="font-display text-4xl font-black text-white tabular-nums">{value}</div>
  </motion.div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <div className="text-zinc-400 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-white font-semibold">
          {p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
};

const Ranking = ({ title, rows }) => (
  <div className="surface rounded-2xl p-5">
    <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-4">{title}</h4>
    <div className="space-y-3">
      {rows?.length ? (
        rows.map((row) => (
          <div key={row.name} className="flex items-center gap-3 text-sm">
            <span className="text-zinc-300 truncate flex-1">{row.name}</span>
            <span className="font-display font-bold text-cyan-400 tabular-nums">{row.count}</span>
          </div>
        ))
      ) : (
        <div className="text-xs text-zinc-600">No data yet</div>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const { t } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setData(r.data)).catch(() => setData(null));
  }, []);

  if (!data) {
    return <div className="text-zinc-500 text-sm">Loading dashboard...</div>;
  }

  const stats = [
    { icon: Users, label: t("admin.totalUsers"), value: data.stats.total_users, accent: "cyan" },
    { icon: Activity, label: t("admin.activeUsers"), value: data.stats.active_users, accent: "emerald" },
    { icon: MessageSquare, label: t("admin.totalMessages"), value: data.stats.total_messages.toLocaleString(), accent: "purple" },
    { icon: UsersRound, label: t("admin.totalGroups"), value: data.stats.total_groups, accent: "cyan" },
    { icon: ShieldAlert, label: t("admin.pendingReports"), value: data.stats.pending_reports, accent: "amber" },
  ];
  const analytics = data.website_analytics;

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-black tracking-tighter text-white mb-1">
          {t("admin.dashboard")}
        </h1>
        <p className="text-sm text-zinc-400">Real-time overview of your ghostel.app community.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} idx={i} />
        ))}
      </div>

      {data.source === "ghostel" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div data-testid="stat-2fa" className="surface rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
              2FA enabled
            </div>
            <div className="font-display text-2xl font-extrabold text-white">
              {data.stats.two_factor_enabled}{" "}
              <span className="text-xs text-zinc-500">/ {data.stats.total_users}</span>
            </div>
          </div>
          <div data-testid="stat-push" className="surface rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
              Push registered
            </div>
            <div className="font-display text-2xl font-extrabold text-white">
              {data.stats.push_ready}{" "}
              <span className="text-xs text-zinc-500">/ {data.stats.total_users}</span>
            </div>
          </div>
          <div className="surface rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
              Online rate
            </div>
            <div className="font-display text-2xl font-extrabold text-cyan-400">
              {data.stats.total_users
                ? Math.round((data.stats.active_users / data.stats.total_users) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      )}

      {analytics && (
        <section data-testid="website-analytics" className="space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">
              Website analytics
            </div>
            <h2 className="font-display text-2xl font-black text-white">ghostel.app traffic</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Anonymous traffic statistics. Active now means activity within the last 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={Radio} label="Active now" value={analytics.active_now} accent="emerald" idx={0} />
            <StatCard icon={Eye} label="Views today" value={analytics.pageviews_today} accent="cyan" idx={1} />
            <StatCard icon={Eye} label="Total views" value={analytics.total_pageviews} accent="purple" idx={2} />
            <StatCard icon={Globe2} label="Unique visitors" value={analytics.total_visitors} accent="cyan" idx={3} />
            <StatCard
              icon={Clock3}
              label="Average session"
              value={formatDuration(analytics.average_duration_seconds)}
              accent="amber"
              idx={4}
            />
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-400 mb-1">
                Last 30 days
              </div>
              <h3 className="font-display text-lg font-bold text-white">Views and unique visitors</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={analytics.daily}>
                <defs>
                  <linearGradient id="websiteViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickFormatter={(value) => value.slice(5)} />
                <YAxis stroke="#52525b" fontSize={11} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="pageviews" stroke="#00e5ff" fill="url(#websiteViews)" strokeWidth={2} />
                <Line type="monotone" dataKey="visitors" stroke="#d946ef" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <Ranking title="Countries" rows={analytics.countries} />
            <Ranking title="Top pages" rows={analytics.top_pages} />
            <Ranking title="Traffic sources" rows={analytics.referrers} />
            <Ranking title="Devices" rows={analytics.devices} />
            <Ranking title="Browsers" rows={analytics.browsers} />
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div data-testid="chart-activity" className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-400 mb-1">
                Activity
              </div>
              <h3 className="font-display text-lg font-bold text-white">{t("admin.userActivity")}</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.activity_chart}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
              <YAxis stroke="#52525b" fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="active" stroke="#00e5ff" strokeWidth={2} fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div data-testid="chart-registrations" className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-fuchsia-400 mb-1">
                Growth
              </div>
              <h3 className="font-display text-lg font-bold text-white">{t("admin.newRegistrations")}</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.registrations_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
              <YAxis stroke="#52525b" fontSize={11} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(34,211,238,0.08)" }} />
              <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div data-testid="chart-messages" className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-400 mb-1">
              Messages
            </div>
            <h3 className="font-display text-lg font-bold text-white">{t("admin.messagesPerDay")}</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.messages_chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
            <YAxis stroke="#52525b" fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#00e5ff"
              strokeWidth={2.5}
              dot={{ fill: "#00e5ff", r: 3 }}
              activeDot={{ r: 6, fill: "#22d3ee" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div data-testid="recent-activity" className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-white mb-4">{t("admin.recentActivity")}</h3>
        <div className="space-y-3">
          {data.recent_activity.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-white/10 grid place-items-center text-xs font-bold text-cyan-400">
                {u.name?.[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{u.name}</div>
                <div className="text-xs text-zinc-500">{u.email}</div>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 text-zinc-400">
                {u.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
