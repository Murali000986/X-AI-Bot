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

const SENSITIVE_KEYS = [
  'openaiKey', 'geminiKey', 'groqKey', 
  'xAppKey', 'xAppSecret', 'xAccessToken', 'xAccessSecret', 'xBearerToken'
];

export async function getSettingsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const settings = await getSettings();
    const obj = settings.toJSON() as any;
    
    // Mask sensitive keys
    for (const key of SENSITIVE_KEYS) {
      if (obj[key]) {
        obj[key] = obj[key].substring(0, 3) + '••••••••';
      }
    }
    
    res.json(obj);
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
      'welcomeMessage', 'xBotUsername', ...SENSITIVE_KEYS
    ];
    
    for (const key of allowed) {
      const val = req.body[key];
      if (val !== undefined) {
        // Skip updates where the frontend just sends back the masked string
        if (typeof val === 'string' && val.includes('••••••••')) {
          continue;
        }
        (settings as any)[key] = val;
      }
    }
    await settings.save();
    
    // Return masked version
    const obj = settings.toJSON() as any;
    for (const key of SENSITIVE_KEYS) {
      if (obj[key]) obj[key] = obj[key].substring(0, 3) + '••••••••';
    }
    res.json(obj);
  } catch (err: unknown) {
    console.error('Failed to update Settings:', err);
    res.status(500).json({ error: 'Failed to update settings', details: String(err) });
  }
}
