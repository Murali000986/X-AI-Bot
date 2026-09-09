import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const TITLES: Record<string, { title: string; desc: string }> = {
  '/':              { title: 'Overview',         desc: 'Platform activity at a glance.' },
  '/conversations': { title: 'Conversations',    desc: 'Review and search agent interactions.' },
  '/users':         { title: 'Users',             desc: 'Registered users and their activity.' },
  '/agents':        { title: 'Agents',            desc: 'Manage and inspect AI agents.' },
  '/models':        { title: 'Models',            desc: 'Configure LLM model preferences.' },
  '/settings':      { title: 'Bot Settings',      desc: 'Global bot configuration.' },
  '/analytics':     { title: 'Analytics',         desc: 'Trending usage and cost data.' },
  '/requests':      { title: 'API Requests',      desc: 'LLM call log with cost tracking.' },
  '/health':        { title: 'System Health',     desc: 'Services, memory, and uptime.' },
};

interface Props {
  children: ReactNode;
  onRefresh?: () => void;
  actions?: ReactNode;
}

export default function PageShell({ children, onRefresh, actions }: Props) {
  const { pathname } = useLocation();
  const meta = TITLES[pathname] ?? { title: '', desc: '' };

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-none">{meta.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
