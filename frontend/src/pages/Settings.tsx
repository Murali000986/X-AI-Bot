import { useEffect, useState } from 'react';
import { api, BotSettings } from '../services/api';
import PageShell from '../components/PageShell';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Save, Check } from 'lucide-react';

function SecretInput({ label, field, value, onChange }: {
  label: string; field: string; value: string; onChange: (f: string, v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          placeholder="Enter value..."
          className="input pr-10"
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Partial<BotSettings>>({});
  const [xCreds, setXCreds] = useState({ xBotUsername: '', xAppKey: '', xAppSecret: '', xAccessToken: '', xAccessSecret: '', xBearerToken: '' });
  const [llmKeys, setLlmKeys] = useState({ openaiKey: '', geminiKey: '', groqKey: '' });
  const [saving, setSaving] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings().then(s => {
      setSettings(s);
      setXCreds({
        xBotUsername: (s as any).xBotUsername || '',
        xAppKey: (s as any).xAppKey || '',
        xAppSecret: (s as any).xAppSecret || '',
        xAccessToken: (s as any).xAccessToken || '',
        xAccessSecret: (s as any).xAccessSecret || '',
        xBearerToken: (s as any).xBearerToken || '',
      });
      setLlmKeys({
        openaiKey: (s as any).openaiKey || '',
        geminiKey: (s as any).geminiKey || '',
        groqKey: (s as any).groqKey || '',
      });
    }).catch(() => {});
  }, []);

  const save = async (section: string, data: Record<string, unknown>) => {
    setSaving(section);
    try {
      await api.updateSettings(data as Partial<BotSettings>);
      setSavedOk(section);
      toast('Saved successfully', 'success');
      setTimeout(() => setSavedOk(null), 2000);
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setSaving(null);
    }
  };

  const SaveBtn = ({ section, data }: { section: string; data: Record<string, unknown> }) => (
    <button
      onClick={() => save(section, data)}
      disabled={saving === section}
      className="btn-primary gap-2 self-end"
    >
      {savedOk === section ? <><Check size={14} /> Saved!</> : saving === section ? 'Saving...' : <><Save size={14} /> Save</>}
    </button>
  );

  return (
    <PageShell>
      <div className="max-w-3xl flex flex-col gap-6">

        {/* X Account Credentials */}
        <div className="card flex flex-col gap-5">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">X (Twitter) Account Setup</h2>
            <p className="text-[13px] text-slate-500 mt-1">Enter your X Developer App credentials. These are used to read mentions and post replies.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Bot Username</label>
              <input className="input" placeholder="@yourbothandle" value={xCreds.xBotUsername} onChange={e => setXCreds(p => ({ ...p, xBotUsername: e.target.value }))} />
            </div>
            <div>
              <label className="label">Bearer Token</label>
              <div className="relative">
                <input type="password" className="input pr-10" placeholder="AAAA..." value={xCreds.xBearerToken} onChange={e => setXCreds(p => ({ ...p, xBearerToken: e.target.value }))} />
              </div>
            </div>
            <SecretInput label="App Key (API Key)" field="xAppKey" value={xCreds.xAppKey} onChange={(f, v) => setXCreds(p => ({ ...p, [f]: v }))} />
            <SecretInput label="App Secret" field="xAppSecret" value={xCreds.xAppSecret} onChange={(f, v) => setXCreds(p => ({ ...p, [f]: v }))} />
            <SecretInput label="Access Token" field="xAccessToken" value={xCreds.xAccessToken} onChange={(f, v) => setXCreds(p => ({ ...p, [f]: v }))} />
            <SecretInput label="Access Secret" field="xAccessSecret" value={xCreds.xAccessSecret} onChange={(f, v) => setXCreds(p => ({ ...p, [f]: v }))} />
          </div>

          <SaveBtn section="xcreds" data={xCreds} />
        </div>

        {/* LLM API Keys */}
        <div className="card flex flex-col gap-5">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">LLM API Keys</h2>
            <p className="text-[13px] text-slate-500 mt-1">Provide at least one key. The bot uses the default provider set below.</p>
          </div>

          <div className="flex flex-col gap-4">
            <SecretInput label="OpenAI API Key" field="openaiKey" value={llmKeys.openaiKey} onChange={(f, v) => setLlmKeys(p => ({ ...p, [f]: v }))} />
            <SecretInput label="Google Gemini API Key" field="geminiKey" value={llmKeys.geminiKey} onChange={(f, v) => setLlmKeys(p => ({ ...p, [f]: v }))} />
            <SecretInput label="Groq API Key" field="groqKey" value={llmKeys.groqKey} onChange={(f, v) => setLlmKeys(p => ({ ...p, [f]: v }))} />
          </div>

          <SaveBtn section="llmkeys" data={llmKeys} />
        </div>

        {/* Bot Config */}
        <div className="card flex flex-col gap-5">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">Bot Configuration</h2>
            <p className="text-[13px] text-slate-500 mt-1">Global settings for how the bot responds.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Default Provider</label>
              <select className="input" value={settings.defaultProvider || 'gemini'} onChange={e => setSettings(p => ({ ...p, defaultProvider: e.target.value }))}>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
              </select>
            </div>
            <div>
              <label className="label">Default Agent</label>
              <select className="input" value={settings.defaultAgent || 'general'} onChange={e => setSettings(p => ({ ...p, defaultAgent: e.target.value }))}>
                <option value="general">General</option>
                <option value="coding">Coding</option>
                <option value="writing">Writing</option>
                <option value="tutor">Tutor</option>
                <option value="summarizer">Summarizer</option>
              </select>
            </div>
            <div>
              <label className="label">Temperature ({settings.temperature ?? 0.7})</label>
              <input type="range" min={0} max={2} step={0.1} value={settings.temperature ?? 0.7} className="w-full" onChange={e => setSettings(p => ({ ...p, temperature: parseFloat(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Max Tokens</label>
              <input type="number" className="input" value={settings.maxTokens ?? 1024} onChange={e => setSettings(p => ({ ...p, maxTokens: parseInt(e.target.value) }))} />
            </div>
          </div>

          <div>
            <label className="label">System Prompt</label>
            <textarea
              rows={4}
              className="input !rounded-2xl resize-none"
              value={settings.systemPrompt ?? ''}
              onChange={e => setSettings(p => ({ ...p, systemPrompt: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettings(p => ({ ...p, botEnabled: !p.botEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.botEnabled ? 'bg-[#829bed]' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.botEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">{settings.botEnabled ? 'Bot Active' : 'Bot Disabled'}</span>
          </div>

          <SaveBtn section="config" data={{ defaultProvider: settings.defaultProvider, defaultAgent: settings.defaultAgent, temperature: settings.temperature, maxTokens: settings.maxTokens, systemPrompt: settings.systemPrompt, botEnabled: settings.botEnabled }} />
        </div>

        {/* App Security */}
        <div className="card flex flex-col gap-4">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800">App Security</h2>
            <p className="text-[13px] text-slate-500 mt-1">Session management and access controls.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="px-4 py-2 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[14px] font-semibold text-rose-600 shadow-sm transition-colors"
            >
              🔒 Lock app / Logout
            </button>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
