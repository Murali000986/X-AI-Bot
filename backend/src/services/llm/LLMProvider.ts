export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokenUsage: TokenUsage;
}

export interface LLMProvider {
  readonly name: string;
  readonly defaultModel: string;
  generateResponse(messages: LLMMessage[], opts?: LLMOptions): Promise<LLMResponse>;
  isAvailable(): boolean;
}
