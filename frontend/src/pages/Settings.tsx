import React, { useEffect, useState } from 'react';
import { api, BotSettings } from '../services/api';
import { useToast } from '../components/Toast';
import PageShell from '../components/PageShell';
import { Save, ToggleLeft, ToggleRight, Key, Settings as SettingsIcon, Twitter, Cpu, Eye, EyeOff } from 'lucide-react';

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div>
        <div className="font-semibold text-slate-800">{label}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
          checked
            ? 'bg-brand-600 text-white shadow-md'
            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
        }`}
      >
        {checked ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
        {checked ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );
}

function PasswordInput({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="input pr-10"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'keys' | 'xbot'>('general');
  const { toast } = useToast();

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => toast('Failed to load settings', 'error'));
  }, [toast]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    try {
      await api.updateSettings(settings);
      toast('Settings saved ✓', 'success');
      // Refresh to get server-masked values
      const refreshed = await api.getSettings();
      setSettings(refreshed);
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <PageShell><div className="text-slate-400 text-sm animate-pulse">Loading settings…</div></PageShell>;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto flex gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-64 flex flex-col gap-2">
          <button 
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <SettingsIcon size={18} />
            General Rules
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'keys' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Cpu size={18} />
            LLM API Keys
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('xbot')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'xbot' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Twitter size={18} />
            X (Twitter) Setup
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={save} className="flex flex-col gap-6">

            {activeTab === 'general' && (
              <div className="animate-in fade-in flex flex-col gap-6">
                <div className="card flex flex-col gap-4">
                  <h3 className="font-semibold text-slate-800">Global Controls</h3>
                  <Toggle
                    checked={settings.botEnabled}
                    onChange={v => setSettings({ ...settings, botEnabled: v })}
                    label="Bot Status"
                    desc="Enable or disable all bot processing globally."
                  />
                  <Toggle
                    checked={settings.autoReplyEnabled}
                    onChange={v => setSettings({ ...settings, autoReplyEnabled: v })}
                    label="Auto Reply"
                    desc="Automatically post replies on X (disable for testing)."
                  />
                </div>

                <div className="card flex flex-col gap-4">
                  <h3 className="font-semibold text-slate-800">Model Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Default Provider</label>
                      <input className="input" value={settings.defaultProvider} onChange={e => setSettings({ ...settings, defaultProvider: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Default Model</label>
                      <input className="input" value={settings.defaultModel} onChange={e => setSettings({ ...settings, defaultModel: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label">Temperature (0–2)</label>
                      <input type="number" step="0.1" min="0" max="2" className="input" value={settings.temperature} onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label">Max Tokens</label>
                      <input type="number" className="input" value={settings.maxTokens} onChange={e => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label">Rate Limit / min</label>
                      <input type="number" className="input" value={settings.rateLimit} onChange={e => setSettings({ ...settings, rateLimit: parseInt(e.target.value) })} />
                    </div>
                  </div>
                </div>

                <div className="card flex flex-col gap-4">
                  <h3 className="font-semibold text-slate-800">Prompt Settings</h3>
                  <div>
                    <label className="label">Welcome Message</label>
                    <input
                      className="input"
                      placeholder="Hi! I'm your X AI assistant. How can I help?"
                      value={(settings as any).welcomeMessage ?? ''}
                      onChange={e => setSettings({ ...settings, welcomeMessage: e.target.value } as any)}
                    />
                  </div>
                  <div>
                    <label className="label">Global System Prompt Override</label>
                    <textarea
                      className="input min-h-[120px] font-mono text-xs leading-relaxed"
                      value={settings.systemPrompt}
                      onChange={e => setSettings({ ...settings, systemPrompt: e.target.value })}
                      placeholder="Leave empty to use per-agent prompts."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="animate-in fade-in flex flex-col gap-6">
                <div className="card flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
                    <Key size={18} className="text-brand-500" />
                    <h3 className="font-semibold text-slate-800">LLM Provider Keys</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Keys modified here will update the bot's credentials immediately. Leave blank to fallback to environment variables.</p>
                  
                  <PasswordInput 
                    label="OpenAI API Key" 
                    value={(settings as any).openaiKey ?? ''} 
                    onChange={v => setSettings({ ...settings, openaiKey: v } as any)}
                    placeholder="sk-..."
                  />
                  <PasswordInput 
                    label="Google Gemini API Key" 
                    value={(settings as any).geminiKey ?? ''} 
                    onChange={v => setSettings({ ...settings, geminiKey: v } as any)}
                    placeholder="AIzaSy..."
                  />
                  <PasswordInput 
                    label="Groq API Key" 
                    value={(settings as any).groqKey ?? ''} 
                    onChange={v => setSettings({ ...settings, groqKey: v } as any)}
                    placeholder="gsk_..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'xbot' && (
              <div className="animate-in fade-in flex flex-col gap-6">
                <div className="card flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
                    <Twitter size={18} className="text-brand-500" />
                    <h3 className="font-semibold text-slate-800">X (Twitter) App Credentials</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Provide these keys from your X Developer portal. The active bot will automatically use them to log in.</p>
                  
                  <div className="mb-4">
                    <label className="label">Bot Username (Handle)</label>
                    <input 
                      className="input" 
                      value={(settings as any).xBotUsername ?? ''} 
                      onChange={v => setSettings({ ...settings, xBotUsername: v.target.value } as any)}
                      placeholder="@YourBotHandle"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PasswordInput 
                      label="API Key (App Key)" 
                      value={(settings as any).xAppKey ?? ''} 
                      onChange={v => setSettings({ ...settings, xAppKey: v } as any)}
                    />
                    <PasswordInput 
                      label="API Secret (App Secret)" 
                      value={(settings as any).xAppSecret ?? ''} 
                      onChange={v => setSettings({ ...settings, xAppSecret: v } as any)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PasswordInput 
                      label="Access Token" 
                      value={(settings as any).xAccessToken ?? ''} 
                      onChange={v => setSettings({ ...settings, xAccessToken: v } as any)}
                    />
                    <PasswordInput 
                      label="Access Token Secret" 
                      value={(settings as any).xAccessSecret ?? ''} 
                      onChange={v => setSettings({ ...settings, xAccessSecret: v } as any)}
                    />
                  </div>

                  <div className="mt-2">
                    <PasswordInput 
                      label="Bearer Token (v2 API)" 
                      value={(settings as any).xBearerToken ?? ''} 
                      onChange={v => setSettings({ ...settings, xBearerToken: v } as any)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200 mt-2">
              <button type="submit" disabled={loading} className="btn-primary gap-2 shadow-lg hover:shadow-xl transition-shadow px-6 py-2.5">
                <Save size={16} />
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
