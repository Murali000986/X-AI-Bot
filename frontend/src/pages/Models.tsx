import React, { useEffect, useState } from 'react';
import { api, ModelsResponse } from '../services/api';
import { useToast } from '../components/Toast';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Models() {
  const [data, setData] = useState<ModelsResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.getModels().then(setData).catch(() => toast('Failed to load models', 'error'));
  }, [toast]);

  if (!data) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">LLM Models</h1>
        <p className="text-sm text-gray-500 mt-1">Available providers and model capabilities.</p>
      </div>

      <div className="grid gap-6">
        {Object.entries(data.models).map(([provider, models]) => {
          const isConfigured = data.availableProviders.includes(provider);
          return (
            <div key={provider} className="card">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-gray-100 capitalize">{provider}</h2>
                {isConfigured ? (
                  <span className="badge-green flex items-center gap-1 px-3 py-1"><CheckCircle2 size={14} /> Configured</span>
                ) : (
                  <span className="badge-gray flex items-center gap-1 px-3 py-1"><XCircle size={14} /> Missing API Key</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {models.map((model) => (
                  <div key={model} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">
                    {model}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
