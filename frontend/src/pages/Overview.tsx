import { useEffect, useState, useCallback } from 'react';
import { Users, MessageSquare, Zap, Hash, DollarSign, UserCheck, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { api, DashboardStats, HealthStatus } from '../services/api';
import { useToast } from '../components/Toast';
import PageShell from '../components/PageShell';

const statConfig = [
  { key: 'totalUsers',    label: 'Total Users',    icon: Users,        color: 'text-violet-600', bg: 'bg-violet-50',  ring: 'ring-violet-100',  sub: (s: DashboardStats) => `${s.activeUsers} active today` },
  { key: 'totalMessages', label: 'Total Messages', icon: MessageSquare, color: 'text-sky-600',   bg: 'bg-sky-50',     ring: 'ring-sky-100',     sub: (s: DashboardStats) => `+${s.messagesToday} today` },
  { key: 'llmRequests',   label: 'LLM Requests',   icon: Zap,           color: 'text-amber-600', bg: 'bg-amber-50',   ring: 'ring-amber-100',   sub: () => 'AI generations total' },
  { key: 'totalTokens',   label: 'Tokens Used',    icon: Hash,          color: 'text-emerald-600',bg: 'bg-emerald-50',ring: 'ring-emerald-100', sub: () => 'across all models' },
  { key: 'totalCostUSD',  label: 'Est. Cost',      icon: DollarSign,    color: 'text-rose-600',  bg: 'bg-rose-50',    ring: 'ring-rose-100',    sub: () => 'approximate USD spend', fmt: (v: number) => `$${(v || 0).toFixed(4)}` },
  { key: 'messagesToday', label: "Today's Msgs",   icon: Clock,         color: 'text-indigo-600',bg: 'bg-indigo-50',  ring: 'ring-indigo-100',  sub: () => 'in last 24h' },
  { key: 'activeUsers',   label: 'Active Users',   icon: UserCheck,     color: 'text-teal-600',  bg: 'bg-teal-50',    ring: 'ring-teal-100',    sub: () => 'active in 24h' },
];

function ServiceDot({ status }: { status: string }) {
  const ok = status === 'ok' || status === 'healthy';
  const connecting = status === 'connecting';
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-500 animate-pulse' : connecting ? 'bg-amber-400' : 'bg-red-500'}`} />
  );
}

function formatUptime(secs: number) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Overview() {
  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [health, setHealth]         = useState<HealthStatus | null>(null);
  const [activity, setActivity]     = useState<{ user: string; agent: string; time: string }[]>([]);
  const { toast } = useToast();

  const load = useCallback(() => {
    api.getStats().then(setStats).catch(() => toast('Failed to load stats', 'error'));
    api.getHealth().then(setHealth).catch(() => {});
    // Recent conversations as activity feed
    api.getConversations(1, '', '').then(data => {
      setActivity(
        (data.conversations ?? []).slice(0, 6).map(c => ({
          user:  `@${c.userId?.username ?? 'unknown'}`,
          agent: c.activeAgent ?? 'general',
          time:  new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }))
      );
    }).catch(() => {});
  }, [toast]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  if (!stats) return (
    <PageShell>
      <div className="flex items-center gap-3 text-slate-400">
        <Zap size={18} className="animate-pulse" /> Loading stats...
      </div>
    </PageShell>
  );

  return (
    <PageShell onRefresh={load} actions={
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full ring-1 ring-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Live · 30s
      </div>
    }>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stat grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statConfig.map(({ key, label, icon: Icon, color, bg, ring, sub, fmt }) => {
            const raw = (stats[key as keyof DashboardStats] as number) || 0;
            const display = fmt ? fmt(raw) : raw.toLocaleString();
            return (
              <div key={key} className="card group hover:shadow-md hover:border-slate-300 transition-all cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">{label}</span>
                  <div className={`w-9 h-9 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center`}>
                    <Icon size={17} className={color} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">{display}</div>
                <div className="text-xs text-slate-400">{sub(stats)}</div>
              </div>
            );
          })}
        </div>

        {/* Health + Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bot Status */}
          <div className="card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 mb-2">Bot Status</div>
              {health ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ServiceDot status={health.services.database} />
                    <span>MongoDB — <span className="font-medium">{health.services.database}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ServiceDot status={health.services.redis} />
                    <span>Redis — <span className="font-medium">{health.services.redis}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ServiceDot status="ok" />
                    <span>Process — <span className="font-medium">up {formatUptime(health.uptime)}</span></span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Loading health...</div>
              )}
            </div>
          </div>

          {/* Memory */}
          {health && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">Memory</span>
                <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-semibold ring-1 ${
                  health.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
                }`}>{health.status}</span>
              </div>
              <div className="space-y-3">
                {([
                  ['Heap Used', health.memory.heapUsed, health.memory.heapTotal],
                  ['RSS',       health.memory.rss,      health.memory.heapTotal * 1.5],
                ] as [string, number, number][]).map(([label, val, max]) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                      <span>{label}</span>
                      <span className="text-slate-700">{val} MB</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, (val / max) * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={15} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">Recent Activity</span>
            </div>
            {activity.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No recent conversations.</div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-brand-50 ring-1 ring-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-brand-600">{a.user.charAt(1).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-700">{a.user}</span>
                      <span className="text-slate-400"> · {a.agent}</span>
                    </div>
                    <span className="text-slate-400 flex-shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
