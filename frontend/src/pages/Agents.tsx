import React, { useEffect, useState } from 'react';
import { api, Agent } from '../services/api';
import { useToast } from '../components/Toast';
import { Bot, Code2, GraduationCap, PenTool, AlignLeft } from 'lucide-react';

const icons: Record<string, any> = {
  general: Bot,
  coding: Code2,
  tutor: GraduationCap,
  writing: PenTool,
  summarizer: AlignLeft,
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    api.getAgents().then(setAgents).catch(() => toast('Failed to load agents', 'error'));
  }, [toast]);

  const toggle = async (agent: Agent) => {
    const newState = !agent.enabled;
    try {
      await api.toggleAgent(agent.key, newState);
      setAgents(agents.map((a) => (a.key === agent.key ? { ...a, enabled: newState } : a)));
      toast(`${agent.name} ${newState ? 'enabled' : 'disabled'}`, 'success');
    } catch {
      toast('Failed to toggle agent', 'error');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">AI Agents</h1>
        <p className="text-sm text-gray-500 mt-1">Manage specialized agent modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const Icon = icons[agent.key] || Bot;
          return (
            <div key={agent.key} className={`card transition-colors ${agent.enabled ? 'border-brand-500/30' : 'opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.enabled ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                  <Icon size={20} />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={agent.enabled} onChange={() => toggle(agent)} />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
              <h3 className="font-semibold text-gray-100">{agent.name}</h3>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{`/${agent.key}`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
