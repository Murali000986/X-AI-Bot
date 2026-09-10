import PageShell from '../components/PageShell';

export default function Settings() {

  return (
    <PageShell>
      <div className="max-w-4xl flex flex-col gap-6">
        
        {/* API Usage */}
        <div className="card">
          <h2 className="text-[16px] font-bold text-slate-800 mb-1">API usage</h2>
          <p className="text-[14px] text-slate-500 mb-6">
            Post-read usage from X's usage endpoint. Messages, search, and profile lookups are billed separately.
          </p>
          
          <div className="flex gap-3 mb-6">
            <button className="btn-primary px-6">Open console</button>
            <button className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#f8f9fc] rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posts Read</div>
              <div className="text-2xl font-bold text-slate-800">492</div>
            </div>
            <div className="bg-[#f8f9fc] rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Post Cap</div>
              <div className="text-2xl font-bold text-slate-800">3,000,000</div>
            </div>
            <div className="bg-[#f8f9fc] rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Post-Read Spend</div>
              <div className="text-2xl font-bold text-slate-800">$0.10</div>
            </div>
          </div>
          
          <p className="text-[12px] text-slate-500">
            Only unique post reads in the current billing window count here. Re-reading the same post within 24 hours usually does not increase the counter.
          </p>
        </div>

        {/* Connected Accounts */}
        <div className="card">
          <h2 className="text-[16px] font-bold text-slate-800 mb-1">Connected accounts</h2>
          <p className="text-[14px] text-slate-500 mb-6">Switch between accounts or disconnect the ones you no longer use.</p>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 shadow-sm rounded-2xl hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                  U
                </div>
                <div>
                  <div className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                    Admin User <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-1">Active</span>
                  </div>
                  <div className="text-[12px] text-slate-500">@admin_user</div>
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
