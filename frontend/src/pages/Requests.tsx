import { useEffect, useState, useCallback } from 'react';
import { api, RequestLog, RequestItem, RequestStats } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import PageShell from '../components/PageShell';
import { Zap, DollarSign, Hash, Filter, ChevronLeft, ChevronRight } from 'lucide-react';



function fmtDate(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Requests() {
  const [data,    setData]    = useState<RequestLog | null>(null);
  const [stats,   setStats]   = useState<RequestStats | null>(null);
  const [page,    setPage]    = useState(1);
  const [model,   setModel]   = useState('');
  const [agent,   setAgent]   = useState('');
  const [active,  setActive]  = useState<RequestItem | null>(null);
  const { toast } = useToast();

  const load = useCallback(() => {
    api.getRequests({ page, model: model || undefined, agent: agent || undefined })
      .then(setData).catch(() => toast('Failed to load requests', 'error'));
  }, [page, model, agent, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.getRequestStats().then(setStats).catch(() => {}); }, []);

  const agents  = Array.from(new Set((data?.requests ?? []).map(r => r.agent).filter(Boolean))) as string[];

  return (
    <PageShell onRefresh={load}>
      <div className="max-w-6xl mx-auto space-y-6">

      {/* Summary bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Zap,         color: 'text-amber-700', label: 'Total Calls',   value: stats.totals.count.toLocaleString() },
            { icon: Hash,        color: 'text-emerald-700',label: 'Total Tokens', value: stats.totals.tokens.toLocaleString() },
            { icon: DollarSign,  color: 'text-rose-400',   label: 'Total Cost',   value: `$${stats.totals.costUSD.toFixed(4)}` },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className="card flex items-center gap-3">
              <Icon size={20} className={color} />
              <div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-lg font-bold text-slate-900">{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={15} className="text-slate-500" />
        <select
          value={model}
          onChange={e => { setModel(e.target.value); setPage(1); }}
          className="bg-slate-100 text-slate-600 text-sm rounded-lg px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All models</option>
          {(stats?.byModel ?? []).map(m => (
            <option key={m.model} value={m.model}>{m.model}</option>
          ))}
        </select>
        <select
          value={agent}
          onChange={e => { setAgent(e.target.value); setPage(1); }}
          className="bg-slate-100 text-slate-600 text-sm rounded-lg px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All agents</option>
          {agents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {(model || agent) && (
          <button onClick={() => { setModel(''); setAgent(''); setPage(1); }} className="text-xs text-slate-500 hover:text-slate-900">Clear</button>
        )}
      </div>

      {/* Model cost table */}
      {stats && stats.byModel.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost by Model</div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="px-5 py-2">Model</th>
                <th className="px-5 py-2 text-right">Calls</th>
                <th className="px-5 py-2 text-right">Prompt Tok</th>
                <th className="px-5 py-2 text-right">Completion Tok</th>
                <th className="px-5 py-2 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.byModel.map(m => (
                <tr key={m.model} className="hover:bg-slate-50/60">
                  <td className="px-5 py-2 text-slate-800 font-mono text-xs">{m.model}</td>
                  <td className="px-5 py-2 text-right text-slate-500">{m.count.toLocaleString()}</td>
                  <td className="px-5 py-2 text-right text-slate-500">{m.promptTokens.toLocaleString()}</td>
                  <td className="px-5 py-2 text-right text-slate-500">{m.completionTokens.toLocaleString()}</td>
                  <td className="px-5 py-2 text-right font-medium text-rose-400">${m.costUSD.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request log table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-500 text-xs">
            <tr>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Agent</th>
              <th className="px-5 py-3 font-medium">Model</th>
              <th className="px-5 py-3 font-medium text-right">Tokens</th>
              <th className="px-5 py-3 font-medium text-right">Cost</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!data ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : data.requests.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No requests found.</td></tr>
            ) : data.requests.map(r => (
              <tr key={r._id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                <td className="px-5 py-3 text-slate-600 text-xs">
                  {typeof r.userId === 'object' && r.userId ? `@${r.userId.username}` : '—'}
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-brand-900/30 text-brand-700 px-2 py-0.5 rounded-full">{r.agent ?? '—'}</span>
                </td>
                <td className="px-5 py-3 text-slate-600 font-mono text-xs">{r.model ?? '—'}</td>
                <td className="px-5 py-3 text-right text-slate-500 text-xs">
                  <span title={`P:${r.tokenUsage.prompt} C:${r.tokenUsage.completion}`}>
                    {r.tokenUsage.total.toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-rose-400 font-medium text-xs">${r.costUSD.toFixed(5)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setActive(r)} className="btn-ghost text-xs">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">Page {page} of {data.pages} · {data.total} total</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 disabled:opacity-40">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pages}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 disabled:opacity-40">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!active} onClose={() => setActive(null)} title={`Request · ${active?.model ?? ''}`}>
        {active && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Agent',       active.agent ?? '—'],
                ['Model',       active.model ?? '—'],
                ['Time',        fmtDate(active.createdAt)],
                ['User',        typeof active.userId === 'object' && active.userId ? `@${active.userId.username}` : '—'],
                ['Prompt tok',  active.tokenUsage.prompt.toLocaleString()],
                ['Completion',  active.tokenUsage.completion.toLocaleString()],
                ['Total tok',   active.tokenUsage.total.toLocaleString()],
                ['Est. cost',   `$${active.costUSD.toFixed(6)}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-0.5">{k}</div>
                  <div className="text-slate-800 font-medium break-all">{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1.5">Response</div>
              <div className="bg-slate-50 p-3 rounded-lg text-slate-600 text-xs whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {active.content}
              </div>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </PageShell>
  );
}
