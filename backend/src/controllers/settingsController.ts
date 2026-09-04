import { Request, Response } from 'express';
import { getSettings } from '../models/BotSettings';

const DEFAULT_SETTINGS = {
  botEnabled: true,
  defaultModel: 'gemini-1.5-flash',
  defaultProvider: 'gemini',
  defaultAgent: 'general',
  systemPrompt: 'You are an AI assistant operating on X (Twitter). Be helpful, concise, friendly, and accurate.',
  temperature: 0.7,
  maxTokens: 1024,
  maxResponseLength: 280,
  rateLimit: 5,
  autoReplyEnabled: true,
};

export async function getSettingsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch {
    res.json(DEFAULT_SETTINGS);
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await getSettings();
    const allowed = [
      'botEnabled', 'defaultModel', 'defaultProvider', 'defaultAgent', 'systemPrompt',
      'temperature', 'maxTokens', 'maxResponseLength', 'rateLimit', 'autoReplyEnabled',
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (settings as Record<string, unknown>)[key] = req.body[key];
      }
    }
    await settings.save();
    res.json(settings);
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}
