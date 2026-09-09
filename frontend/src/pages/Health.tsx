import { useEffect, useState, useCallback } from 'react';
import { api, HealthStatus } from '../services/api';
import PageShell from '../components/PageShell';
import { Database, Server, Clock, Cpu, RefreshCw } from 'lucide-react';

function formatUptime(secs: number) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

function StatusBadge({ status }: { status: string }) {
  const ok  = status === 'ok' || status === 'healthy';
  const mid = status === 'connecting' || status === 'degraded';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      ok  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' :
      mid ? 'bg-amber-50   text-amber-700  ring-1 ring-amber-200'   :
            'bg-red-50     text-red-400    ring-1 ring-red-500/30'
    }`}>
      {status}
    </span>
  );
}

function MemoryBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min(100, (used / total) * 100);
  const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>{label}</span>
        <span>{used} MB / {total} MB <span className="text-gray-600">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const SERVICE_META: Record<string, { label: string; icon: typeof Database; desc: string }> = {
  database: { label: 'MongoDB',      icon: Database, desc: 'Primary data store for users, conversations, messages' },
  redis:    { label: 'Redis',        icon: Server,   desc: 'Rate limiting & session cache' },
};

export default function Health() {
  const [health,       setHealth]       = useState<HealthStatus | null>(null);
  const [lastRefresh,  setLastRefresh]  = useState<Date>(new Date());
  const [countdown,    setCountdown]    = useState(30);

  const load = useCallback(async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
      setLastRefresh(new Date());
      setCountdown(30);
    } catch {
      /* silently fail */
    }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c <= 1 ? 30 : c - 1)), 1_000);
    return () => clearInterval(t);
  }, [lastRefresh]);

  return (
    <PageShell
      onRefresh={load}
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-gray-700 text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          {health && <StatusBadge status={health.status} />}
          <span className="text-xs text-slate-400">Next refresh in {countdown}s</span>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">

      {!health ? (
        <div className="text-slate-500 text-sm animate-pulse">Loading health data...</div>
      ) : (
        <>
          {/* Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(health.services).map(([key, status]) => {
              const meta = SERVICE_META[key] ?? { label: key, icon: Server, desc: '' };
              const Icon = meta.icon;
              const ok   = status === 'ok';
              return (
                <div key={key} className={`card flex items-start gap-4 border ${ok ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ok ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <Icon size={18} className={ok ? 'text-emerald-700' : 'text-red-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 text-sm">{meta.label}</span>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-xs text-slate-500">{meta.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* Process */}
            <div className="card flex items-start gap-4 border border-emerald-500/20">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-sm">Bot Process</span>
                  <StatusBadge status="ok" />
                </div>
                <p className="text-xs text-slate-500">Uptime: <span className="text-slate-600 font-medium">{formatUptime(health.uptime)}</span></p>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={16} className="text-slate-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Memory Usage</h3>
            </div>
            <div className="space-y-4">
              <MemoryBar label="Heap Used"  used={health.memory.heapUsed}  total={health.memory.heapTotal} />
              <MemoryBar label="RSS (total process)" used={health.memory.rss} total={Math.round(health.memory.heapTotal * 1.6)} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {([
                ['Heap Used',  health.memory.heapUsed  + ' MB'],
                ['Heap Total', health.memory.heapTotal + ' MB'],
                ['RSS',        health.memory.rss       + ' MB'],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                  <div className="text-slate-800 font-bold text-base">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      </div>
    </PageShell>
  );
}
