import { BaseAgent } from './BaseAgent';
import { GeneralAgent } from './GeneralAgent';
import { CodingAgent } from './CodingAgent';
import { TutorAgent } from './TutorAgent';
import { WritingAgent } from './WritingAgent';
import { SummarizerAgent } from './SummarizerAgent';
import { getLLMProvider } from '../services/llm/LLMFactory';
import { LLMMessage } from '../services/llm/LLMProvider';
import { logger } from '../utils/logger';

type AgentKey = 'general' | 'coding' | 'tutor' | 'writing' | 'summarizer';

const agents: Record<AgentKey, BaseAgent> = {
  general: new GeneralAgent(),
  coding: new CodingAgent(),
  tutor: new TutorAgent(),
  writing: new WritingAgent(),
  summarizer: new SummarizerAgent(),
};

// Command → agent mapping
const COMMAND_MAP: Record<string, AgentKey> = {
  '/ask': 'general',
  '/code': 'coding',
  '/learn': 'tutor',
  '/write': 'writing',
  '/summarize': 'summarizer',
};

export interface ParsedMessage {
  command?: string;
  agentKey: AgentKey;
  cleanContent: string;
  isReset: boolean;
  isHelp: boolean;
}

export function parseMessage(rawText: string, botUsername: string): ParsedMessage {
  // Remove bot mention
  const text = rawText.replace(new RegExp(`@${botUsername}`, 'gi'), '').trim();

  // /reset
  if (/^\/reset\b/i.test(text)) {
    return { agentKey: 'general', cleanContent: '', isReset: true, isHelp: false };
  }

  // /help
  if (/^\/help\b/i.test(text)) {
    return { agentKey: 'general', cleanContent: '', isReset: false, isHelp: true };
  }

  // Explicit command
  for (const [cmd, agent] of Object.entries(COMMAND_MAP)) {
    if (text.toLowerCase().startsWith(cmd)) {
      const content = text.slice(cmd.length).trim();
      return { command: cmd, agentKey: agent, cleanContent: content, isReset: false, isHelp: false };
    }
  }

  return { agentKey: 'general', cleanContent: text, isReset: false, isHelp: false };
}

/** Uses LLM intent classification to pick an agent when no command is given. */
export async function classifyIntent(text: string, provider: string): Promise<AgentKey> {
  try {
    const llm = getLLMProvider(provider);
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `Classify the user message into one agent: general, coding, tutor, writing, summarizer.
Respond with ONLY the agent name, nothing else.
- coding: programming, code, debug, algorithm, software
- tutor: learn, explain, teach, understand, concept, study
- writing: write, post, caption, email, content, draft
- summarizer: summarize, summary, tldr, key points
- general: everything else`,
      },
      { role: 'user', content: text },
    ];
    const result = await llm.generateResponse(messages, { maxTokens: 10, temperature: 0 });
    const key = result.content.trim().toLowerCase() as AgentKey;
    return agents[key] ? key : 'general';
  } catch (err) {
    logger.warn('Intent classification failed, defaulting to general:', err);
    return 'general';
  }
}

export function getAgent(key: AgentKey): BaseAgent {
  return agents[key] ?? agents.general;
}

export function listAgents() {
  return Object.values(agents).map((a) => ({ key: a.agentKey, name: a.agentName }));
}

export const HELP_TEXT = `👋 I'm your AI assistant on X!

Commands:
• /ask <question> — General Q&A
• /code <question> — Code & programming
• /learn <topic> — Step-by-step explanations
• /write <request> — Content & writing
• /summarize <text> — Summarize text
• /reset — Clear conversation memory
• /help — Show this message

Or just mention me without a command!`;
