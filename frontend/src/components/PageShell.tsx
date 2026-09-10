import { useEffect, useState } from 'react';
import { api, XProfile } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Moon } from 'lucide-react';

const TITLES: Record<string, { title: string; desc: string }> = {
  '/':         { title: 'Welcome back.',  desc: "Search people and chat — that's the core of X AI Bot." },
  '/search':   { title: 'Search',         desc: 'Find people by name or username.' },
  '/messages': { title: 'Messages',       desc: 'Messages synced from the X API.' },
  '/users':    { title: 'My profile',     desc: 'Your account, followers, and following.' },
  '/settings': { title: 'Settings',       desc: 'API usage, account connections, and security.' },
};

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
  actions?: ReactNode;
  onRefresh?: () => void;
}

export default function PageShell({ children, actions, onRefresh }: Props) {
  const { pathname } = useLocation();
  const meta = TITLES[pathname] ?? { title: '', desc: '' };
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<XProfile | null>(null);

  useEffect(() => {
    api.getXProfile().then(setProfile).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex flex-col min-h-full bg-[#f8f9fc]">
      <header className="px-10 pt-8 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">{meta.title}</h1>
          <p className="text-[15px] font-medium text-slate-500 mt-1.5">{meta.desc}</p>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          {onRefresh && (
            <button onClick={onRefresh} className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all shadow-sm" title="Refresh">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          )}
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Moon size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-1 pr-4 py-1 bg-white border border-slate-200 rounded-full hover:shadow-sm transition-shadow"
            title="Logout"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e4e8f7] flex items-center justify-center text-[#525db3] font-bold text-xs">
              {profile?.profileImage
                ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                : (profile?.username?.[0]?.toUpperCase() || 'U')}
            </div>
            <span className="text-[13px] font-semibold text-slate-700">@{profile?.username || 'admin'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 px-10 pb-10">
        {children}
      </div>
    </div>
  );
}
