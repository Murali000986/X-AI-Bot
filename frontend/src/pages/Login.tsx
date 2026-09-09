import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast('Login successful', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-50"
      style={{ background: 'radial-gradient(circle at top right, #f8fafc 0%, #f1f5f9 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-brand-200 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-sky-200 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/30">
            <Zap size={32} className="text-slate-900" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">X AI Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Sign in to manage your bot</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1 h-11 text-base rounded-xl">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          X AI Chatbot Admin · Secured access
        </p>
      </div>
    </div>
  );
}
