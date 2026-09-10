import { useEffect, useState } from 'react';
import { api, ConversationList, Conversation, Message as APIMessage } from '../services/api';
import PageShell from '../components/PageShell';
import { Mail, Search, MessageSquare, Bot } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Requests() {
  const [data, setData] = useState<ConversationList | null>(null);
  const [activeConv, setActiveConv] = useState<{ conv: Conversation; msgs: APIMessage[] } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.getConversations(1, '', '').then(setData).catch(() => toast('Failed to load', 'error'));
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
    <PageShell>
      <div className="max-w-6xl mx-auto h-[calc(100vh-160px)]">
        
        <div className="border border-slate-100 rounded-3xl bg-white shadow-sm flex overflow-hidden h-full">
          
          {/* Left panel - Connection List */}
          <div className="w-[320px] flex-shrink-0 border-r border-slate-100 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-[45%] text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations"
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-50 transition-all font-medium"
                />
              </div>
              <button className="px-3 py-2 text-[13px] font-semibold text-slate-600 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                Refresh
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!data ? (
                <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
              ) : data.conversations.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-slate-500 leading-relaxed max-w-[200px] mx-auto mt-10">
                  No conversations yet. Find someone in Search and tap Message.
                </div>
              ) : (
                data.conversations.map(conv => (
                  <button 
                    key={conv._id} 
                    onClick={() => viewDetails(conv)}
                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${activeConv?.conv._id === conv._id ? 'bg-[#f8f9fc] border-l-2 border-l-[#829bed]' : ''}`}
                  >
                    <div className="font-semibold text-slate-800 text-[14px] truncate">{conv.userId.displayName}</div>
                    <div className="text-[12px] text-slate-500 mb-1">@{conv.userId.username}</div>
                    <div className="text-[13px] text-slate-600 truncate">{conv.summary || 'Start of conversation...'}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel - Chat */}
          <div className="flex-1 flex flex-col bg-[#fcfdff]">
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f0f2fb] text-[#6b7cbe] flex items-center justify-center mb-4">
                  <Mail size={20} />
                </div>
                <div className="text-[16px] font-bold text-slate-800 mb-1">Select a conversation</div>
                <div className="text-[13px] text-slate-500 max-w-[240px] text-center leading-relaxed">
                  Pick a thread on the left, or find someone in Search and tap Message.
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{activeConv.conv.userId.displayName}</div>
                    <div className="text-sm text-slate-500">@{activeConv.conv.userId.username}</div>
                  </div>
                  {activeConv.conv.activeAgent && (
                    <span className="text-xs font-bold bg-[#f0f2fb] text-[#6b7cbe] px-3 py-1 rounded-full uppercase tracking-wide">
                      {activeConv.conv.activeAgent}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                  {activeConv.msgs.map(m => (
                    <div key={m._id} className={`flex gap-3 max-w-[70%] ${m.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto ${m.role === 'user' ? 'bg-slate-200 text-slate-500' : 'bg-[#e4e8f7] text-[#525db3]'}`}>
                        {m.role === 'user' ? <MessageSquare size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`px-4 py-3 rounded-[20px] text-[14px] leading-relaxed shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-[#829bed] text-white rounded-br-sm' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}
