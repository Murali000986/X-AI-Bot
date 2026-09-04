import { useEffect, useState } from 'react';
import { Users, MessageSquare, Zap, Hash, TrendingUp, Activity } from 'lucide-react';
import { api, DashboardStats } from '../services/api';
import { useToast } from '../components/Toast';

const statConfig = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: Users,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-100',
    sub: (s: DashboardStats) => `${s.activeUsers} active`,
  },
  {
    key: 'totalMessages',
    label: 'Total Messages',
    icon: MessageSquare,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    ring: 'ring-sky-100',
    sub: (s: DashboardStats) => `+${s.messagesToday} today`,
  },
  {
    key: 'llmRequests',
    label: 'LLM Requests',
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
    sub: () => 'AI generations',
  },
  {
    key: 'totalTokens',
    label: 'Tokens Used',
    icon: Hash,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
    sub: () => 'across all models',
  },
];

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.getStats().then(setStats).catch(() => toast('Failed to load stats', 'error'));
  }, [toast]);

  if (!stats) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <Activity size={18} className="animate-pulse" /> Loading stats...
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Platform activity at a glance.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full ring-1 ring-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map(({ key, label, icon: Icon, color, bg, ring, sub }) => (
          <div key={key} className="stat-card group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <div className={`w-9 h-9 rounded-lg ${bg} ring-1 ${ring} flex items-center justify-center`}>
                <Icon size={17} className={color} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {(stats[key as keyof DashboardStats] as number).toLocaleString()}
            </div>
            <div className={`text-xs ${color} mt-1 font-medium`}>{sub(stats)}</div>
          </div>
        ))}
      </div>

      {/* Quick info panel */}
      <div className="card flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 ring-1 ring-brand-100 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={18} className="text-brand-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">Bot is online and running</div>
          <div className="text-xs text-slate-500 mt-0.5">Listening for mentions · AI agents active · Admin controls available</div>
        </div>
      </div>
    </div>
  );
}
