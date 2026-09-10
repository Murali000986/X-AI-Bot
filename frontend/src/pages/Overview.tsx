import { useEffect, useState } from 'react';
import { Search, Mail, User } from 'lucide-react';
import PageShell from '../components/PageShell';
import { useNavigate } from 'react-router-dom';
import { api, XProfile, DashboardStats } from '../services/api';

export default function Overview() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<XProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  useEffect(() => {
    // Attempt to load X profile and local DB stats
    api.getXProfile().then(setProfile).catch(() => {});
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <PageShell>
      <div className="max-w-4xl flex flex-col gap-8">
        
        {/* Connected Account Card */}
        <div className="card !p-0">
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden flex items-start justify-center">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Admin`} alt="avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Connected Account</div>
                <div className="text-xl font-bold text-slate-800">{profile?.displayName || 'Admin'}</div>
                <div className="text-[13px] text-slate-500">@{profile?.username || 'admin_bot'}</div>
              </div>
            </div>
            <button className="px-4 py-1.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              View profile
            </button>
          </div>

          <div className="flex">
            <div className="flex-1 py-6 flex flex-col items-center justify-center border-r border-slate-100">
              <div className="text-2xl font-bold text-slate-800">{profile?.followersCount?.toLocaleString() || stats?.activeUsers || 0}</div>
              <div className="text-[13px] font-medium text-slate-400">Followers</div>
            </div>
            <div className="flex-1 py-6 flex flex-col items-center justify-center border-r border-slate-100">
              <div className="text-2xl font-bold text-slate-800">{profile?.followingCount?.toLocaleString() || 0}</div>
              <div className="text-[13px] font-medium text-slate-400">Following</div>
            </div>
            <div className="flex-1 py-6 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-slate-800">{profile?.tweetCount?.toLocaleString() || stats?.totalMessages || 0}</div>
              <div className="text-[13px] font-medium text-slate-400">Posts</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 gap-4">
            
            <button 
              onClick={() => navigate('/conversations')}
              className="card !p-5 flex items-center justify-between hover:border-indigo-100 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f2fb] text-[#6b7cbe] flex items-center justify-center">
                  <Search size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[15px]">Find people</div>
                  <div className="text-[13px] text-slate-500">Search accounts by name</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">›</span>
            </button>

            <button 
              onClick={() => navigate('/requests')}
              className="card !p-5 flex items-center justify-between hover:border-indigo-100 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f2fb] text-[#6b7cbe] flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[15px]">Open inbox</div>
                  <div className="text-[13px] text-slate-500">Read and reply to DMs</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">›</span>
            </button>

            <button 
              onClick={() => navigate('/users')}
              className="card !p-5 flex items-center justify-between hover:border-indigo-100 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f2fb] text-[#6b7cbe] flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-[15px]">View profile</div>
                  <div className="text-[13px] text-slate-500">Your account details</div>
                </div>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">›</span>
            </button>

          </div>
        </div>

        {/* Good to know */}
        <div className="card bg-white mt-2">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Good to know</h2>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-[#829bed] shrink-0" />
              <span className="text-[14px] text-slate-500">Search someone, then tap Message to start a conversation.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-[#829bed] shrink-0" />
              <span className="text-[14px] text-slate-500">API usage lives under Settings and refreshes from live project metrics.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-[#829bed] shrink-0" />
              <span className="text-[14px] text-slate-500">Messages sync from official API events, so only recent history is available.</span>
            </li>
          </ul>
        </div>
        
      </div>
    </PageShell>
  );
}
