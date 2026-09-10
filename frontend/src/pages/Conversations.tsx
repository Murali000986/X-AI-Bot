import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import PageShell from '../components/PageShell';
import { api, ConversationList } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Conversations() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ConversationList | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await api.getConversations(1, query.trim(), '');
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-4xl flex flex-col gap-6">

        {/* Search Input */}
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-[45%] text-slate-400" />
          <input
            type="text"
            placeholder="Search people or usernames..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            className="w-full pl-11 pr-24 py-4 rounded-3xl bg-white border border-slate-100 text-slate-900 placeholder-slate-400 text-[15px] focus:outline-none shadow-sm focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all font-medium"
          />
          <button
            onClick={doSearch}
            className="absolute right-2 top-1/2 -translate-y-[45%] rounded-2xl bg-[#829bed] hover:bg-[#728be0] text-white px-5 py-2 font-semibold text-sm transition-all"
          >
            Search
          </button>
        </div>

        {/* Results or Empty State */}
        {!results && !loading && (
          <div className="card flex flex-col items-center justify-center py-20 border border-slate-100 rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-[#f0f2fb] text-[#6b7cbe] flex items-center justify-center mb-4">
              <SearchIcon size={24} />
            </div>
            <div className="text-[17px] font-bold text-slate-800 mb-1">Search for anyone</div>
            <div className="text-[14px] text-slate-500 max-w-xs text-center">
              Try a username or display name, then message them from the result.
            </div>
          </div>
        )}

        {loading && (
          <div className="card text-center py-12 text-slate-500 text-sm">Searching...</div>
        )}

        {results && results.conversations.length === 0 && (
          <div className="card text-center py-12 text-slate-500 text-sm">No conversations found for "{query}".</div>
        )}

        {results && results.conversations.length > 0 && (
          <div className="flex flex-col gap-3">
            {results.conversations.map(conv => (
              <button
                key={conv._id}
                onClick={() => navigate('/messages')}
                className="card !py-4 !px-5 flex items-center justify-between text-left hover:border-indigo-100 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0f2fb] text-[#6b7cbe] flex items-center justify-center font-bold text-lg">
                    {conv.userId.displayName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-[15px]">{conv.userId.displayName}</div>
                    <div className="text-[13px] text-slate-500">@{conv.userId.username}</div>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-[#829bed] group-hover:underline">Message →</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </PageShell>
  );
}
