import { LLMProvider } from './LLMProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GroqProvider } from './GroqProvider';

const providerInstances: Record<string, LLMProvider> = {
  gemini: new GeminiProvider(),
  openai: new OpenAIProvider(),
  groq: new GroqProvider(),
};

export function getLLMProvider(providerName: string): LLMProvider {
  const provider = providerInstances[providerName.toLowerCase()];
  if (!provider) throw new Error(`Unknown LLM provider: ${providerName}`);
  if (!provider.isAvailable()) throw new Error(`LLM provider "${providerName}" is not configured (missing API key)`);
  return provider;
}

export function getAvailableProviders(): string[] {
  return Object.entries(providerInstances)
    .filter(([, p]) => p.isAvailable())
    .map(([name]) => name);
}

export { LLMProvider };
