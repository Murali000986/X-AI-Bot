import Groq from 'groq-sdk';
import { LLMMessage, LLMOptions, LLMProvider, LLMResponse } from './LLMProvider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class GroqProvider implements LLMProvider {
  readonly name = 'groq';
  readonly defaultModel = 'openai/gpt-oss-120b';
  private client: Groq | null = null;

  constructor() {
    if (env.GROQ_API_KEY) {
      this.client = new Groq({ apiKey: env.GROQ_API_KEY });
    }
  }

  isAvailable(): boolean {
    return !!env.GROQ_API_KEY && !!this.client;
  }

  async generateResponse(messages: LLMMessage[], opts: LLMOptions = {}): Promise<LLMResponse> {
    if (!this.client) throw new Error('Groq API key not configured');

    const modelName = opts.model || this.defaultModel;
    const completion = await this.client.chat.completions.create({
      model: modelName,
      messages: messages.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    logger.debug(`Groq response: ${content.slice(0, 80)}...`);

    return {
      content,
      model: modelName,
      provider: this.name,
      tokenUsage: {
        prompt: completion.usage?.prompt_tokens ?? 0,
        completion: completion.usage?.completion_tokens ?? 0,
        total: completion.usage?.total_tokens ?? 0,
      },
    };
  }
}
