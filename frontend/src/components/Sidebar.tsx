import { NavLink } from 'react-router-dom';
import {
  Home, Search, MessageSquare, User, Settings
} from 'lucide-react';

const navItems = [
  { to: '/',              icon: Home,          label: 'Home' },
  { to: '/conversations', icon: Search,        label: 'Search' }, // Using Conversations as Search for now based on context
  { to: '/requests',      icon: MessageSquare, label: 'Messages' },
  { to: '/users',         icon: User,          label: 'Profile' },
  { to: '/settings',      icon: Settings,      label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-[260px] flex flex-col h-screen bg-[#f8f9fc] flex-shrink-0 z-10 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#525db3] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          C
        </div>
        <div className="text-xl font-semibold text-slate-800 tracking-tight">Chat</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-[20px] text-[15px] font-semibold transition-all ${
                isActive
                  ? 'bg-[#e4e8f7] text-[#4d5b9f] shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] border border-[#d2d9ec]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`
            }
          >
            <Icon size={20} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
