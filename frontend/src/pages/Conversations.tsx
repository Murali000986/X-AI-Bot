import { useEffect, useState, useCallback } from 'react';
import { api, ConversationList, Conversation, Message } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import PageShell from '../components/PageShell';
import { MessageSquare, Bot, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const AGENT_KEYS = ['general', 'coding', 'writing', 'tutor', 'summarizer'];

export default function Conversations() {
  const [data,       setData]       = useState<ConversationList | null>(null);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [agentFilt,  setAgentFilt]  = useState('');
  const [activeConv, setActiveConv] = useState<{ conv: Conversation; msgs: Message[] } | null>(null);
  const { toast } = useToast();

  const load = useCallback(() => {
    api.getConversations(page, search, agentFilt)
      .then(setData).catch(() => toast('Failed to load conversations', 'error'));
  }, [page, search, agentFilt, toast]);

  useEffect(() => { load(); }, [load]);

  const viewDetails = async (conv: Conversation) => {
    try {
      const details = await api.getConversation(conv._id);
      setActiveConv({ conv: details.conversation, msgs: details.messages });
    } catch {
      toast('Failed to load messages', 'error');
    }
  };

  const exportConversation = () => {
    if (!activeConv) return;
    const blob = new Blob([JSON.stringify(activeConv, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `conversation-${activeConv.conv._id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell onRefresh={load}>
      <div className="max-w-6xl mx-auto">

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by username…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-100 text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 placeholder-gray-600"
          />
        </div>
        <select
          value={agentFilt}
          onChange={e => { setAgentFilt(e.target.value); setPage(1); }}
          className="bg-slate-100 text-slate-600 text-sm rounded-lg px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All agents</option>
          {AGENT_KEYS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {(search || agentFilt) && (
          <button onClick={() => { setSearch(''); setAgentFilt(''); setPage(1); }} className="text-xs text-slate-500 hover:text-slate-900">Clear</button>
        )}
      </div>

        <div className="card overflow-hidden p-0">
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <MessageSquare size={14} className="text-brand-500" />
            <span className="text-sm font-semibold text-slate-700">{data?.total ?? '…'} total conversations</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
              <tr>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Summary</th>
              <th className="px-6 py-3 font-medium">Agent</th>
              <th className="px-6 py-3 font-medium">Last Updated</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {!data ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : data.conversations.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No conversations found.</td></tr>
            ) : data.conversations.map((conv) => (
              <tr key={conv._id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{conv.userId.displayName}</div>
                  <div className="text-xs text-slate-500">@{conv.userId.username}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 max-w-xs truncate">
                    {conv.summary || <span className="text-gray-600 italic">No summary yet</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-brand-900/30 text-brand-700 px-2 py-0.5 rounded-full">
                    {conv.activeAgent || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => viewDetails(conv)} className="btn-ghost">View</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">Page {page} of {data.pages} · {data.total} total</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 disabled:opacity-40">
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pages}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 disabled:opacity-40">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Detail Modal */}
      <Modal isOpen={!!activeConv} onClose={() => setActiveConv(null)} title={`Conversation with @${activeConv?.conv.userId.username}`}>
        <div className="flex flex-col gap-4">
          {activeConv?.conv.summary && (
            <div className="bg-brand-50 border border-brand-500/20 p-3 rounded-lg text-sm text-brand-700">
              <strong>Context Summary:</strong> {activeConv.conv.summary}
            </div>
          )}

          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
            {activeConv?.msgs.map((m) => (
              <div key={m._id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} className="text-slate-900" />
                  </div>
                )}
                <div className={`p-3 rounded-xl max-w-[80%] text-sm ${
                  m.role === 'user'
                    ? 'bg-slate-100 text-slate-800 rounded-tr-sm'
                    : 'bg-brand-900/30 border border-brand-500/20 text-slate-600 rounded-tl-sm'
                }`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">{m.agent}</span>
                      <span className="text-[10px] text-slate-500">{m.model}</span>
                      {m.tokenUsage && (
                        <span className="text-[10px] text-gray-600 ml-auto">
                          {m.tokenUsage.total} tok · ~${((m.tokenUsage.total * 0.10) / 1_000_000).toFixed(5)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare size={14} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={exportConversation} className="flex items-center gap-2 self-end text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <Download size={12} /> Export JSON
          </button>
        </div>
      </Modal>
      </div>
    </PageShell>
  );
}
