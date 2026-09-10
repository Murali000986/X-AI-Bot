import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { api, XProfile, DashboardStats } from '../services/api';

export default function Settings() {
  const [profile, setProfile] = useState<XProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getXProfile().then(setProfile).catch(() => {});
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <PageShell>
      <div className="max-w-4xl flex flex-col gap-6">
        
        {/* API Usage */}
        <div className="card">
          <h2 className="text-[16px] font-bold text-slate-800 mb-1">API usage</h2>
          <p className="text-[14px] text-slate-500 mb-6">
            Post-read usage and language model generations are billed separately. View your live backend metrics here.
          </p>
          
          <div className="flex gap-3 mb-6">
            <button className="btn-primary px-6">Open console</button>
            <button 
              onClick={() => api.getStats().then(setStats)}
              className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#f8f9fc] rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posts Read</div>
              <div className="text-2xl font-bold text-slate-800">{stats?.totalMessages?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-[#f8f9fc] rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Post Cap</div>
              <div className="text-2xl font-bold text-slate-800">3,000,000</div>
            </div>
            <div className="bg-[#f8f9fc] rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. LLM Spend</div>
              <div className="text-2xl font-bold text-slate-800">${stats?.totalCostUSD?.toFixed(4) || '0.0000'}</div>
            </div>
          </div>
          
          <p className="text-[12px] text-slate-500">
            Only unique post reads and AI completions in the current billing window count here. 
          </p>
        </div>

        {/* Connected Accounts */}
        <div className="card">
          <h2 className="text-[16px] font-bold text-slate-800 mb-1">Connected accounts</h2>
          <p className="text-[14px] text-slate-500 mb-6">Switch between accounts or disconnect the ones you no longer use.</p>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 shadow-sm rounded-2xl hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                  {profile?.profileImage ? (
                    <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : 'U'}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                    {profile?.displayName || 'Unknown Connected User'}
                     <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-1">Active</span>
                  </div>
                  <div className="text-[12px] text-slate-500">@{profile?.username || 'bot_handle'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[13px] font-semibold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
                  ✕ Disconnect
                </button>
              </div>
            </div>
            
            <button className="self-start text-[14px] font-semibold text-slate-600 hover:text-slate-900 mt-2 px-2 py-1">
              + Connect another account
            </button>
          </div>
        </div>

        {/* App Security */}
        <div className="card">
          <h2 className="text-[16px] font-bold text-slate-800 mb-1">App security</h2>
          <p className="text-[14px] text-slate-500 mb-4">Lock Chat so this browser has to enter the app password again.</p>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-[14px] font-semibold text-slate-700 shadow-sm transition-colors">
             Lock app 
          </button>
        </div>

      </div>
    </PageShell>
  );
}
