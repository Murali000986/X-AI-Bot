import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMMessage, LLMOptions, LLMProvider, LLMResponse } from './LLMProvider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getSettings } from '../../models/BotSettings';

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  readonly defaultModel = 'gemini-1.5-flash';

  isAvailable(): boolean {
    return true; // We check at runtime now
  }

  async generateResponse(messages: LLMMessage[], opts: LLMOptions = {}): Promise<LLMResponse> {
    const settings = await getSettings();
    const key = settings.geminiKey || env.GEMINI_API_KEY;
    if (!key) throw new Error('Gemini API key not configured in dashboard or env');
    const client = new GoogleGenerativeAI(key);

    const modelName = opts.model || this.defaultModel;
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxTokens ?? 1024,
      },
    });

    // Extract system prompt and chat history
    const systemMsg = messages.find((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    const systemInstruction = systemMsg?.content;
    const modelWithSystem = systemInstruction
      ? client.getGenerativeModel({ model: modelName, systemInstruction, generationConfig: { temperature: opts.temperature ?? 0.7, maxOutputTokens: opts.maxTokens ?? 1024 } })
      : model;

    // Convert to Gemini history format
    const history = chatMessages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = chatMessages[chatMessages.length - 1];
    if (!lastMessage) throw new Error('No user message provided');

    const chat = modelWithSystem.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    const usage = response.usageMetadata;
    logger.debug(`Gemini response: ${text.slice(0, 80)}...`);

    return {
      content: text,
      model: modelName,
      provider: this.name,
      tokenUsage: {
        prompt: usage?.promptTokenCount ?? 0,
        completion: usage?.candidatesTokenCount ?? 0,
        total: usage?.totalTokenCount ?? 0,
      },
    };
  }
}
