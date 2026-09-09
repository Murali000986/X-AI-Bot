import Groq from 'groq-sdk';
import { LLMMessage, LLMOptions, LLMProvider, LLMResponse } from './LLMProvider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getSettings } from '../../models/BotSettings';

export class GroqProvider implements LLMProvider {
  readonly name = 'groq';
  readonly defaultModel = 'openai/gpt-oss-120b';

  isAvailable(): boolean {
    return true; 
  }

  async generateResponse(messages: LLMMessage[], opts: LLMOptions = {}): Promise<LLMResponse> {
    const settings = await getSettings();
    const key = settings.groqKey || env.GROQ_API_KEY;
    if (!key) throw new Error('Groq API key not configured in dashboard or env');
    const client = new Groq({ apiKey: key });

    const modelName = opts.model || this.defaultModel;
    const completion = await client.chat.completions.create({
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
