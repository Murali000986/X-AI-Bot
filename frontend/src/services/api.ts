const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';  // local dev uses Vite proxy

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Dashboard
  getStats: () => request<DashboardStats>('/dashboard/stats'),

  // Users
  getUsers: (page = 1) => request<UserList>(`/users?page=${page}`),
  getUser: (id: string) => request<User>(`/users/${id}`),
  blockUser: (id: string) => request<{ message: string }>(`/users/${id}/block`, { method: 'POST' }),
  unblockUser: (id: string) => request<{ message: string }>(`/users/${id}/unblock`, { method: 'POST' }),
  getUserConversations: (id: string) => request<Conversation[]>(`/users/${id}/conversations`),

  // Conversations
  getConversations: (page = 1, search = '', agent = '') =>
    request<ConversationList>(`/conversations?page=${page}&search=${encodeURIComponent(search)}&agent=${encodeURIComponent(agent)}`),
  getConversation: (id: string) => request<ConversationDetail>(`/conversations/${id}`),
  getMessages: (page = 1) => request<MessageList>(`/messages?page=${page}`),

  // Analytics
  getAnalytics: (days = 7) => request<Analytics>(`/analytics?days=${days}`),

  // LLM Requests
  getRequests: (params: { page?: number; limit?: number; model?: string; agent?: string; from?: string; to?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page)  q.set('page',  String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.model) q.set('model', params.model);
    if (params.agent) q.set('agent', params.agent);
    if (params.from)  q.set('from',  params.from);
    if (params.to)    q.set('to',    params.to);
    return request<RequestLog>(`/requests?${q.toString()}`);
  },
  getRequestStats: () => request<RequestStats>('/requests/stats'),

  // Health
  getHealth: () => request<HealthStatus>('/health'),

  // Settings
  getSettings: () => request<BotSettings>('/settings'),
  updateSettings: (data: Partial<BotSettings>) =>
    request<BotSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Agents
  getAgents: () => request<Agent[]>('/agents'),
  toggleAgent: (key: string, enabled: boolean) =>
    request<Agent>(`/agents/${key}`, { method: 'PUT', body: JSON.stringify({ enabled }) }),

  // Models
  getModels: () => request<ModelsResponse>('/models'),

  // Test
  testAgent: (data: TestAgentRequest) =>
    request<TestAgentResponse>('/test-agent', { method: 'POST', body: JSON.stringify(data) }),
};


// ---- Types ----
export interface DashboardStats {
  totalUsers: number;
  totalMessages: number;
  messagesToday: number;
  activeUsers: number;
  totalTokens: number;
  llmRequests: number;
  totalCostUSD: number;
}

export interface User {
  _id: string;
  xUserId: string;
  username: string;
  displayName: string;
  profileImage?: string;
  messageCount: number;
  lastActive: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface UserList { users: User[]; total: number; page: number; pages: number; }

export interface Conversation {
  _id: string;
  userId: UserRef;
  summary?: string;
  activeAgent: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRef { _id: string; username: string; displayName: string; xUserId: string; }
export interface ConversationList { conversations: Conversation[]; total: number; page: number; pages: number; }
export interface ConversationDetail { conversation: Conversation; messages: Message[]; }

export interface Message {
  _id: string;
  conversationId: string;
  userId: UserRef | string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  model?: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
  tweetId?: string;
  createdAt: string;
}

export interface MessageList { messages: Message[]; total: number; page: number; pages: number; }

export interface BotSettings {
  botEnabled: boolean;
  defaultModel: string;
  defaultProvider: string;
  defaultAgent: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  maxResponseLength: number;
  rateLimit: number;
  autoReplyEnabled: boolean;
}

export interface Agent { key: string; name: string; enabled: boolean; }
export interface ModelsResponse {
  models: Record<string, string[]>;
  availableProviders: string[];
}

export interface AnalyticsDay { _id: string; count: number; }
export interface AgentUsage { _id: string; count: number; }
export interface ProviderUsage { _id: string; count: number; tokens: number; }
export interface TokenDay { _id: string; tokens: number; }

export interface Analytics {
  messagesPerDay: AnalyticsDay[];
  usersPerDay: AnalyticsDay[];
  agentUsage: AgentUsage[];
  providerUsage: ProviderUsage[];
  tokenPerDay: TokenDay[];
}

export interface TestAgentRequest { message: string; agentKey?: string; provider?: string; model?: string; }
export interface TestAgentResponse { content: string; agent: string; model: string; provider: string; tokenUsage: { prompt: number; completion: number; total: number }; }

export interface RequestItem {
  _id: string;
  createdAt: string;
  userId: UserRef | null;
  agent?: string;
  model?: string;
  tweetId?: string;
  tokenUsage: { prompt: number; completion: number; total: number };
  costUSD: number;
  content: string;
}
export interface RequestLog { requests: RequestItem[]; total: number; page: number; pages: number; }

export interface RequestModelStat {
  model: string;
  count: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD: number;
}
export interface RequestStats {
  byModel: RequestModelStat[];
  totals: { count: number; tokens: number; costUSD: number };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  services: { database: string; redis: string };
  memory: { rss: number; heapUsed: number; heapTotal: number };
}

