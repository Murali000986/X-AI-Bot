import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api, Analytics as AnalyticsData } from '../services/api';
import { useToast } from '../components/Toast';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.getAnalytics(14).then(setData).catch(() => toast('Failed to load analytics', 'error'));
  }, [toast]);

  if (!data) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">14-day trending data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Chart */}
        <div className="card h-80">
          <h3 className="font-medium text-gray-400 mb-4">Messages per Day</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data.messagesPerDay}>
              <defs>
                <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="_id" tick={{fontSize: 12}} tickMargin={10} minTickGap={20} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px'}} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMsgs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Token Usage Chart */}
        <div className="card h-80">
          <h3 className="font-medium text-gray-400 mb-4">Token Consumption</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.tokenPerDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="_id" tick={{fontSize: 12}} tickMargin={10} minTickGap={20} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px'}} />
              <Bar dataKey="tokens" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Distribution */}
        <div className="card h-80">
          <h3 className="font-medium text-gray-400 mb-4">Agent Usage</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.agentUsage} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{fontSize: 12}} />
              <YAxis dataKey="_id" type="category" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px'}} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
