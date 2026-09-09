import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { UserIcon, Download } from 'lucide-react';
import PageShell from '../components/PageShell';

interface User { _id: string; username: string; displayName: string; messageCount: number; lastActive: string; }

function exportCSV(users: User[]) {
  const header = ['Username', 'Display Name', 'Messages', 'Last Active'];
  const rows   = users.map(u => [u.username, u.displayName, u.messageCount, new Date(u.lastActive).toLocaleDateString()]);
  const csv    = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob   = new Blob([csv], { type: 'text/csv' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `users-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = () => {
    api.getUsers().then((data: { users: User[] }) => setUsers(data.users)).catch(() => toast('Failed to load users', 'error'));
  };
  useEffect(load, []);

  return (
    <PageShell
      onRefresh={load}
      actions={
        <button onClick={() => exportCSV(users)} disabled={!users.length} className="btn-ghost gap-1.5 text-xs border border-slate-200 rounded-xl shadow-sm">
          <Download size={14} /> Export CSV
        </button>
      }
    >
      <div className="max-w-5xl mx-auto">
        <div className="card overflow-hidden p-0">

          {/* Summary bar */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
            <UserIcon size={14} className="text-brand-500" />
            <span className="text-sm font-semibold text-slate-700">{users.length} registered users</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Username</th>
                <th className="px-6 py-3 font-semibold text-right">Messages</th>
                <th className="px-6 py-3 font-semibold text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">No users yet.</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                        {(u.displayName || u.username).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{u.displayName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500">@{u.username}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="font-semibold text-slate-800">{u.messageCount}</span>
                  </td>
                  <td className="px-6 py-3 text-right text-slate-500">{new Date(u.lastActive).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
