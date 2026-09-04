import React, { useEffect, useState } from 'react';
import { api, BotSettings } from '../services/api';
import { useToast } from '../components/Toast';

export default function Settings() {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [loading, setLoading] = useState(false);
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
      toast('Settings saved', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Bot Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global bot behavior.</p>
      </div>

      <form onSubmit={save} className="card flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <div className="font-medium text-gray-200">Bot Status</div>
            <div className="text-sm text-gray-500">Enable or disable bot processing globally.</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.botEnabled} onChange={(e) => setSettings({ ...settings, botEnabled: e.target.checked })} />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <div className="font-medium text-gray-200">Auto Reply</div>
            <div className="text-sm text-gray-500">Automatically post replies on X (disable for testing).</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.autoReplyEnabled} onChange={(e) => setSettings({ ...settings, autoReplyEnabled: e.target.checked })} />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Default Provider</label>
            <input className="input" value={settings.defaultProvider} onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value })} />
          </div>
          <div>
            <label className="label">Default Model</label>
            <input className="input" value={settings.defaultModel} onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Temperature (0-2)</label>
            <input type="number" step="0.1" className="input" value={settings.temperature} onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="label">Max Tokens</label>
            <input type="number" className="input" value={settings.maxTokens} onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="label">Rate Limit (per min)</label>
            <input type="number" className="input" value={settings.rateLimit} onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) })} />
          </div>
        </div>

        <div>
          <label className="label">Global System Prompt (Override)</label>
          <textarea
            className="input min-h-[120px] font-mono text-xs"
            value={settings.systemPrompt}
            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-fit self-end">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
