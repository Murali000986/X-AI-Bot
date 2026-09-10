import { Search as SearchIcon } from 'lucide-react';
import PageShell from '../components/PageShell';

export default function Conversations() {
  return (
    <PageShell>
      <div className="max-w-4xl flex flex-col gap-8 h-[calc(100vh-160px)]">
        
        {/* Search Input */}
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-[45%] text-slate-400" />
          <input
            type="text"
            placeholder="Search people or usernames..."
            className="w-full pl-11 pr-24 py-4 rounded-3xl bg-white border border-slate-100 text-slate-900 placeholder-slate-400 text-[15px] focus:outline-none shadow-sm focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all font-medium"
          />
          <button className="absolute right-2 top-1/2 -translate-y-[45%] rounded-2xl bg-[#829bed] hover:bg-[#728be0] text-white px-5 py-2 font-semibold text-sm transition-all focus:ring-4 focus:ring-indigo-100">
            Search
          </button>
        </div>

        {/* Empty State Space */}
        <div className="card flex-1 flex flex-col items-center justify-center p-0 shadow-sm border border-slate-100 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-[#f0f2fb] text-[#6b7cbe] flex items-center justify-center mb-4">
            <SearchIcon size={24} />
          </div>
          <div className="text-[17px] font-bold text-slate-800 mb-1">Search for anyone</div>
          <div className="text-[14px] text-slate-500 max-w-xs text-center">
            Try a username or display name, then message them from the result.
          </div>
        </div>

      </div>
    </PageShell>
  );
}
