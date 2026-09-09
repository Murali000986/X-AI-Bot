import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Users, Bot, Cpu, Settings, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Zap, FileText, Heart
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Overview' },
  { to: '/conversations', icon: MessageSquare,   label: 'Conversations' },
  { to: '/users',         icon: Users,           label: 'Users' },
  { to: '/agents',        icon: Bot,             label: 'Agents' },
  { to: '/models',        icon: Cpu,             label: 'Models' },
  { to: '/requests',      icon: FileText,        label: 'API Requests' },
  { to: '/analytics',     icon: BarChart3,       label: 'Analytics' },
  { to: '/health',        icon: Heart,           label: 'Health' },
  { to: '/settings',      icon: Settings,        label: 'Bot Settings' },
];


export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 z-10`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-md">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">X AI Bot</div>
            <div className="text-xs text-slate-500">Admin Dashboard</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3 flex flex-col gap-1.5 bg-slate-50/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost w-full justify-center text-slate-500 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse Sidebar</span></>}
        </button>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-colors w-full justify-center">
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
