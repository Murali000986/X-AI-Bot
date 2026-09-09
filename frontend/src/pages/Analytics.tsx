import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api, Analytics as AnalyticsData } from '../services/api';
import { useToast } from '../components/Toast';
import PageShell from '../components/PageShell';

const DAY_OPTIONS = [7, 14, 30] as const;
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const chartTooltipStyle = { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#0f172a' };

export default function Analytics() {
  const [days, setDays]   = useState<7 | 14 | 30>(14);
  const [data, setData]   = useState<AnalyticsData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setData(null);
    api.getAnalytics(days).then(setData).catch(() => toast('Failed to load analytics', 'error'));
  }, [days, toast]);

  // Build cost-per-day from token data (approximate: use 0.10/1M blended rate for display)
  const costPerDay = (data?.tokenPerDay ?? []).map(d => ({
    _id:     d._id,
    costUSD: parseFloat(((d.tokens * 0.10) / 1_000_000).toFixed(4)),
  }));

  return (
    <PageShell
      actions={
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {DAY_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition-all ${
                days === d ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >{d}d</button>
          ))}
        </div>
      }
    >

      {!data ? (
        <div className="text-slate-500 text-sm animate-pulse">Loading charts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages per Day */}
          <div className="card h-72">
            <h3 className="font-medium text-slate-500 mb-4">Messages per Day</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={data.messagesPerDay}>
                <defs>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tick={{fontSize:11}} tickMargin={8} minTickGap={20} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMsgs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Token Consumption */}
          <div className="card h-72">
            <h3 className="font-medium text-slate-500 mb-4">Token Consumption</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data.tokenPerDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tick={{fontSize:11}} tickMargin={8} minTickGap={20} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="tokens" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Estimated Cost per Day */}
          <div className="card h-72">
            <h3 className="font-medium text-slate-500 mb-4">Est. Cost per Day (USD)</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={costPerDay}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tick={{fontSize:11}} tickMargin={8} minTickGap={20} />
                <YAxis tick={{fontSize:11}} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`$${v}`, 'Cost']} />
                <Area type="monotone" dataKey="costUSD" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Agent Distribution */}
          <div className="card h-72">
            <h3 className="font-medium text-slate-500 mb-4">Agent Usage</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={data.agentUsage} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, percent }) => `${_id} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {data.agentUsage.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* New Users per Day */}
          <div className="card h-72">
            <h3 className="font-medium text-slate-500 mb-4">New Users per Day</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data.usersPerDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tick={{fontSize:11}} tickMargin={8} minTickGap={20} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Provider breakdown */}
          <div className="card h-72">
            <h3 className="font-medium text-slate-500 mb-4">Provider Breakdown</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data.providerUsage} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{fontSize:11}} />
                <YAxis dataKey="_id" type="category" tick={{fontSize:11}} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </PageShell>
  );
}
