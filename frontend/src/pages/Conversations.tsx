import React, { useEffect, useState } from 'react';
import { api, ConversationList, Conversation, Message } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { MessageSquare, Bot } from 'lucide-react';

export default function Conversations() {
  const [data, setData] = useState<ConversationList | null>(null);
  const [activeConv, setActiveConv] = useState<{ conv: Conversation; msgs: Message[] } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.getConversations().then(setData).catch(() => toast('Failed to load conversations', 'error'));
  }, [toast]);

  const viewDetails = async (conv: Conversation) => {
    try {
      const details = await api.getConversation(conv._id);
      setActiveConv({ conv: details.conversation, msgs: details.messages });
    } catch {
      toast('Failed to load messages', 'error');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Conversations</h1>
        <p className="text-sm text-gray-500 mt-1">Review agent interactions.</p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Summary</th>
              <th className="px-6 py-3 font-medium">Last Updated</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data?.conversations.map((conv) => (
              <tr key={conv._id} className="hover:bg-gray-800/20">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-200">{conv.userId.displayName}</div>
                  <div className="text-xs text-gray-500">@{conv.userId.username}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-300 max-w-sm truncate">{conv.summary || <span className="text-gray-600 italic">No summary yet</span>}</div>
                </td>
                <td className="px-6 py-4 text-gray-400">{new Date(conv.updatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => viewDetails(conv)} className="btn-ghost">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!activeConv} onClose={() => setActiveConv(null)} title={`Conversation with @${activeConv?.conv.userId.username}`}>
        <div className="flex flex-col gap-4">
          {activeConv?.conv.summary && (
            <div className="bg-brand-500/10 border border-brand-500/20 p-3 rounded-lg text-sm text-brand-400">
              <strong>Context Summary:</strong> {activeConv.conv.summary}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            {activeConv?.msgs.map((m) => (
              <div key={m._id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                
                <div className={`p-3 rounded-xl max-w-[80%] text-sm ${m.role === 'user' ? 'bg-gray-800 text-gray-200 rounded-tr-sm' : 'bg-brand-900/30 border border-brand-500/20 text-gray-300 rounded-tl-sm'}`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">{m.agent}</span>
                      <span className="text-[10px] text-gray-500">{m.model}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare size={14} className="text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
