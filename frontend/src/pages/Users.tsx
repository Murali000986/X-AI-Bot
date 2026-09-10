import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { api, XProfile, DashboardStats } from '../services/api';

export default function Users() {
  const [profile, setProfile] = useState<XProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  useEffect(() => {
    api.getXProfile().then(setProfile).catch(() => {});
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <PageShell>
      <div className="max-w-4xl flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="card !p-0">
          <div className="h-32 bg-slate-100"></div>
          <div className="p-6 relative">
            <div className="absolute -top-10 left-6 w-20 h-20 rounded-full border-4 border-white bg-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
               {profile?.profileImage ? (
                  <img src={profile.profileImage.replace('_normal', '')} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl font-bold text-slate-500">U</div>
                )}
            </div>
            
            <div className="mt-10">
              <h2 className="text-xl font-bold text-slate-800">{profile?.displayName || 'Unknown Connected User'}</h2>
              <div className="text-[13px] text-slate-500 mb-4">@{profile?.username || 'bot_handle'}</div>
              
              <p className="text-[14px] text-slate-600 mb-6 max-w-2xl leading-relaxed">
                System Administrator for the X AI Chatbot. Managing global settings, models, and bot parameters.
              </p>
              
              <div className="flex items-center gap-6 text-[14px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">{profile?.followersCount?.toLocaleString() || stats?.activeUsers || 0}</span>
                  <span className="text-slate-500">Followers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">{profile?.followingCount?.toLocaleString() || 0}</span>
                  <span className="text-slate-500">Following</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">{profile?.tweetCount?.toLocaleString() || stats?.totalMessages || 0}</span>
                  <span className="text-slate-500">Posts</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[13px] text-slate-500 font-medium">You can message this account.</div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
