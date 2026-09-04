import { LLMMessage, LLMOptions, LLMResponse } from '../services/llm/LLMProvider';
import { getLLMProvider } from '../services/llm/LLMFactory';
import { getAgentPrompt } from '../prompts/systemPrompts';

export interface AgentContext {
  userMessage: string;
  conversationHistory: LLMMessage[];
  conversationSummary?: string;
  provider: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentResponse {
  content: string;
  agent: string;
  model: string;
  provider: string;
  tokenUsage: { prompt: number; completion: number; total: number };
}

export abstract class BaseAgent {
  abstract readonly agentName: string;
  abstract readonly agentKey: string;

  protected buildMessages(ctx: AgentContext): LLMMessage[] {
    const messages: LLMMessage[] = [];

    // System prompt
    messages.push({ role: 'system', content: getAgentPrompt(this.agentKey) });

    // Long-term memory summary as first user/assistant exchange
    if (ctx.conversationSummary) {
      messages.push({ role: 'user', content: '[Previous conversation summary]' });
      messages.push({ role: 'assistant', content: ctx.conversationSummary });
    }

    // Recent history
    messages.push(...ctx.conversationHistory);

    // Current user message
    messages.push({ role: 'user', content: ctx.userMessage });

    return messages;
  }

  async respond(ctx: AgentContext): Promise<AgentResponse> {
    const provider = getLLMProvider(ctx.provider);
    const messages = this.buildMessages(ctx);
    const opts: LLMOptions = {
      model: ctx.model,
      temperature: ctx.temperature,
      maxTokens: ctx.maxTokens,
    };

    const result: LLMResponse = await provider.generateResponse(messages, opts);

    return {
      content: result.content,
      agent: this.agentKey,
      model: result.model,
      provider: result.provider,
      tokenUsage: result.tokenUsage,
    };
  }
}
