import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TITLES: Record<string, { title: string; desc: string }> = {
  '/':              { title: 'Home',     desc: 'Search people and chat — that\'s the core of Chat.' },
  '/conversations': { title: 'Search',   desc: 'Find people by name or username.' },
  '/requests':      { title: 'Messages', desc: 'Messages are stored locally. Use Refresh only when you need live updates.' },
  '/users':         { title: 'My profile',  desc: 'Your account, followers, and following.' },
  '/settings':      { title: 'Settings', desc: 'API usage, account connections, and security.' },
};

interface Props {
  children: ReactNode;
  actions?: ReactNode;
  onRefresh?: () => void;
}

export default function PageShell({ children, actions, onRefresh }: Props) {
  const { pathname } = useLocation();
  const meta = TITLES[pathname] ?? { title: '', desc: '' };
  const { logout } = useAuth();

  return (
    <div className="flex flex-col min-h-full bg-[#f8f9fc]">
      {/* Top bar with Profile snippet */}
      <header className="px-10 pt-8 pb-4 flex items-start justify-between">
        <div>
          {/* Replicating the header layout from reference images: bold title, thin description */}
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">{pathname === '/' ? 'Welcome back, User.' : meta.title}</h1>
          <p className="text-[15px] font-medium text-slate-500 mt-1.5">{meta.desc}</p>
        </div>
        
        {/* Profile Pill */}
        <div className="flex items-center gap-4">
          {actions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all shadow-sm"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          )}
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Moon size={20} />
          </button>
          
          <button onClick={logout} className="flex items-center gap-2 px-1 pr-4 py-1 bg-white border border-slate-200 rounded-full hover:shadow-sm transition-shadow">
            <div className="w-8 h-8 rounded-full bg-[#e4e8f7] flex items-center justify-center text-[#525db3] font-bold text-xs">
              U
            </div>
            <span className="text-[13px] font-semibold text-slate-700">@superuser</span>
          </button>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-10 pb-10">
        {children}
      </div>
    </div>
  );
}
