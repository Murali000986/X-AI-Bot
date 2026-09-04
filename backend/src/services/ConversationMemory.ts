import mongoose from 'mongoose';
import { Conversation, IConversation } from '../models/Conversation';
import { Message, IMessage } from '../models/Message';
import { LLMMessage } from './llm/LLMProvider';
import { getLLMProvider } from './llm/LLMFactory';
import { logger } from '../utils/logger';

const RECENT_WINDOW = 15;   // messages kept verbatim
const SUMMARIZE_TRIGGER = 30; // summarize when total > this

export interface MemoryContext {
  conversationId: string;
  history: LLMMessage[];
  summary?: string;
}

export async function getOrCreateConversation(userId: mongoose.Types.ObjectId): Promise<IConversation> {
  let conv = await Conversation.findOne({ userId }).sort({ updatedAt: -1 });
  if (!conv) {
    conv = await Conversation.create({ userId, activeAgent: 'general' });
  }
  return conv;
}

export async function loadContext(conversationId: mongoose.Types.ObjectId): Promise<MemoryContext> {
  const conv = await Conversation.findById(conversationId);
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

  const history: LLMMessage[] = messages.slice(-RECENT_WINDOW).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return {
    conversationId: conversationId.toString(),
    history,
    summary: conv?.summary,
  };
}

export async function saveMessage(data: {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  model?: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
  tweetId?: string;
}): Promise<IMessage> {
  const msg = await Message.create(data);
  await Conversation.findByIdAndUpdate(data.conversationId, { updatedAt: new Date() });
  return msg;
}

export async function resetConversation(userId: mongoose.Types.ObjectId): Promise<void> {
  await Conversation.findOneAndUpdate(
    { userId },
    { summary: undefined, activeAgent: 'general', updatedAt: new Date() }
  );
  const conv = await Conversation.findOne({ userId });
  if (conv) {
    await Message.deleteMany({ conversationId: conv._id });
  }
}

/**
 * Summarizes old messages when the conversation grows too large.
 * Keeps last RECENT_WINDOW messages verbatim, summarizes the rest.
 */
export async function maybeAutoSummarize(
  conversationId: mongoose.Types.ObjectId,
  provider: string
): Promise<void> {
  const count = await Message.countDocuments({ conversationId });
  if (count <= SUMMARIZE_TRIGGER) return;

  const oldMessages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(count - RECENT_WINDOW);

  const transcript = oldMessages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  try {
    const llm = getLLMProvider(provider);
    const result = await llm.generateResponse(
      [
        { role: 'system', content: 'Summarize this conversation into 3-5 sentences capturing key context and topics.' },
        { role: 'user', content: transcript },
      ],
      { maxTokens: 300, temperature: 0.3 }
    );

    await Conversation.findByIdAndUpdate(conversationId, { summary: result.content });
    // Delete the old messages we just summarized
    const ids = oldMessages.map((m) => m._id);
    await Message.deleteMany({ _id: { $in: ids } });
    logger.info(`Auto-summarized ${oldMessages.length} messages for conversation ${conversationId}`);
  } catch (err) {
    logger.error('Auto-summarize failed:', err);
  }
}
