import { Request, Response } from 'express';
import { listAgents, getAgent } from '../agents/AgentRouter';
import { getAvailableProviders } from '../services/llm/LLMFactory';

// In-memory toggle store (persisted in BotSettings in full deployment)
const disabledAgents = new Set<string>();

export async function getAgents(_req: Request, res: Response): Promise<void> {
  const agents = listAgents().map((a) => ({
    ...a,
    enabled: !disabledAgents.has(a.key),
  }));
  res.json(agents);
}

export async function toggleAgent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { enabled } = req.body as { enabled: boolean };

  if (enabled) {
    disabledAgents.delete(id);
  } else {
    disabledAgents.add(id);
  }

  res.json({ key: id, enabled });
}

export async function getModels(_req: Request, res: Response): Promise<void> {
  const models = {
    gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    groq: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
  };
  const available = getAvailableProviders();
  res.json({ models, availableProviders: available });
}

export async function testAgent(req: Request, res: Response): Promise<void> {
  const { message, agentKey, provider, model } = req.body as {
    message: string; agentKey?: string; provider?: string; model?: string;
  };

  if (!message) { res.status(400).json({ error: 'message is required' }); return; }

  try {
    const agent = getAgent((agentKey as 'general') ?? 'general');
    const result = await agent.respond({
      userMessage: message,
      conversationHistory: [],
      provider: provider ?? 'gemini',
      model,
    });
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
}
