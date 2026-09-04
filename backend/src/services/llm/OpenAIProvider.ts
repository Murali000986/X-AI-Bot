import OpenAI from 'openai';
import { LLMMessage, LLMOptions, LLMProvider, LLMResponse } from './LLMProvider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  readonly defaultModel = 'gpt-4o-mini';
  private client: OpenAI | null = null;

  constructor() {
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  isAvailable(): boolean {
    return !!env.OPENAI_API_KEY && !!this.client;
  }

  async generateResponse(messages: LLMMessage[], opts: LLMOptions = {}): Promise<LLMResponse> {
    if (!this.client) throw new Error('OpenAI API key not configured');

    const modelName = opts.model || this.defaultModel;
    const completion = await this.client.chat.completions.create({
      model: modelName,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    logger.debug(`OpenAI response: ${content.slice(0, 80)}...`);

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
