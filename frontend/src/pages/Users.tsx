import React, { useEffect, useState } from 'react';
import { api, UserList, User } from '../services/api';
import { useToast } from '../components/Toast';
import { Ban, CheckCircle2, Search } from 'lucide-react';

export default function Users() {
  const [data, setData] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = () => {
    setLoading(true);
    api.getUsers().then(setData).catch(() => toast('Failed to load users', 'error')).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const toggleBlock = async (user: User) => {
    try {
      if (user.isBlocked) await api.unblockUser(user._id);
      else await api.blockUser(user._id);
      toast(`User ${user.isBlocked ? 'unblocked' : 'blocked'}`, 'success');
      loadData();
    } catch {
      toast('Failed to change user status', 'error');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage X bot users.</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Messages</th>
              <th className="px-6 py-3 font-medium">Last Active</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : data?.users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-800" />
                    )}
                    <div>
                      <div className="font-medium text-gray-200">{user.displayName}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{user.messageCount}</td>
                <td className="px-6 py-4 text-gray-400">{new Date(user.lastActive).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {user.isBlocked ? <span className="badge-red">Blocked</span> : <span className="badge-green">Active</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggleBlock(user)} className="btn-ghost text-xs px-2 py-1">
                    {user.isBlocked ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Ban size={14} className="text-red-400" />}
                    <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
