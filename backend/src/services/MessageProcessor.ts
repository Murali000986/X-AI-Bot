import mongoose from 'mongoose';
import { User } from '../models/User';
import { ProcessedTweet } from '../models/ProcessedTweet';
import { getSettings } from '../models/BotSettings';
import { getOrCreateConversation, loadContext, saveMessage, resetConversation, maybeAutoSummarize } from './ConversationMemory';
import { moderateInput, moderateOutput } from './ModerationService';
import { checkUserRateLimit, checkGlobalRateLimit } from './RateLimiter';
import { parseMessage, classifyIntent, getAgent, HELP_TEXT } from '../agents/AgentRouter';
import { formatForX } from './ResponseFormatter';
import { XApiProvider } from './x/XApiProvider';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export interface ProcessResult {
  success: boolean;
  response?: string;
  agent?: string;
  error?: string;
}

const xProvider = new XApiProvider();

export async function processTweet(tweet: {
  id: string;
  text: string;
  authorId: string;
  username: string;
  displayName: string;
  profileImage?: string;
}): Promise<ProcessResult> {
  const start = Date.now();

  // 1. Duplicate check
  const alreadyProcessed = await ProcessedTweet.exists({ tweetId: tweet.id });
  if (alreadyProcessed) {
    logger.info(`Skipping duplicate tweet ${tweet.id}`);
    return { success: true };
  }

  const settings = await getSettings();
  if (!settings.botEnabled) {
    return { success: true };
  }

  // 2. Find or create user
  let user = await User.findOne({ xUserId: tweet.authorId });
  if (!user) {
    user = await User.create({
      xUserId: tweet.authorId,
      username: tweet.username,
      displayName: tweet.displayName,
      profileImage: tweet.profileImage,
    });
  }

  if (user.isBlocked) {
    logger.info(`Blocked user @${tweet.username} — ignoring tweet ${tweet.id}`);
    await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });
    return { success: true };
  }

  // 3. Rate limiting
  const userRl = await checkUserRateLimit(tweet.authorId, settings.rateLimit);
  if (!userRl.allowed) {
    if (settings.autoReplyEnabled) {
      await xProvider.replyToTweet(tweet.id, `@${tweet.username} ${userRl.reason}`);
    }
    await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });
    return { success: true, response: userRl.reason };
  }

  const globalRl = await checkGlobalRateLimit(200);
  if (!globalRl.allowed) {
    await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });
    return { success: false, error: 'Global rate limit exceeded' };
  }

  // 4. Parse message
  const parsed = parseMessage(tweet.text, env.X_BOT_USERNAME);

  // Handle /help
  if (parsed.isHelp) {
    if (settings.autoReplyEnabled) {
      await xProvider.replyToTweet(tweet.id, `@${tweet.username} ${HELP_TEXT}`);
    }
    await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });
    return { success: true, response: HELP_TEXT };
  }

  // Handle /reset
  if (parsed.isReset) {
    await resetConversation(user._id as mongoose.Types.ObjectId);
    const resetMsg = `@${tweet.username} Conversation reset! Start fresh with your next message.`;
    if (settings.autoReplyEnabled) {
      await xProvider.replyToTweet(tweet.id, resetMsg);
    }
    await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });
    return { success: true, response: resetMsg };
  }

  // 5. Input moderation
  const inputMod = moderateInput(parsed.cleanContent);
  if (!inputMod.passed) {
    const errMsg = `@${tweet.username} ${inputMod.reason}`;
    if (settings.autoReplyEnabled) {
      await xProvider.replyToTweet(tweet.id, errMsg);
    }
    await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });
    return { success: true, response: errMsg };
  }

  // 6. Load conversation + determine agent
  const conversation = await getOrCreateConversation(user._id as mongoose.Types.ObjectId);
  const ctx = await loadContext(conversation._id as mongoose.Types.ObjectId);

  let agentKey = parsed.agentKey;
  if (agentKey === 'general' && !parsed.command) {
    // LLM-based intent classification
    agentKey = await classifyIntent(parsed.cleanContent, settings.defaultProvider);
  }

  const agent = getAgent(agentKey);

  // 7. Save user message
  await saveMessage({
    conversationId: conversation._id as mongoose.Types.ObjectId,
    userId: user._id as mongoose.Types.ObjectId,
    role: 'user',
    content: parsed.cleanContent,
    tweetId: tweet.id,
  });

  // 8. Generate LLM response
  let llmResponse;
  try {
    llmResponse = await agent.respond({
      userMessage: parsed.cleanContent,
      conversationHistory: ctx.history,
      conversationSummary: ctx.summary,
      provider: settings.defaultProvider,
      model: settings.defaultModel,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    });
  } catch (err: unknown) {
    logger.error('LLM generation failed:', err);
    const errMsg = `@${tweet.username} Sorry, I'm having trouble right now. Please try again.`;
    if (settings.autoReplyEnabled) {
      await xProvider.replyToTweet(tweet.id, errMsg);
    }
    await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });
    return { success: false, error: String(err) };
  }

  // 9. Output moderation
  const outputMod = moderateOutput(llmResponse.content);
  const finalContent = outputMod.passed
    ? formatForX(`@${tweet.username} ${llmResponse.content}`, settings.maxResponseLength)
    : `@${tweet.username} I can't respond to that. Please try a different request.`;

  // 10. Save assistant message + reply on X
  await saveMessage({
    conversationId: conversation._id as mongoose.Types.ObjectId,
    userId: user._id as mongoose.Types.ObjectId,
    role: 'assistant',
    content: finalContent,
    agent: llmResponse.agent,
    model: llmResponse.model,
    tokenUsage: llmResponse.tokenUsage,
    tweetId: tweet.id,
  });

  await User.findByIdAndUpdate(user._id, {
    $inc: { messageCount: 1 },
    lastActive: new Date(),
    username: tweet.username,
    displayName: tweet.displayName,
  });

  if (settings.autoReplyEnabled) {
    await xProvider.replyToTweet(tweet.id, finalContent);
  }

  // 11. Mark as processed
  await ProcessedTweet.create({ tweetId: tweet.id, userId: tweet.authorId });

  // 12. Background summarization if conversation is getting long
  maybeAutoSummarize(conversation._id as mongoose.Types.ObjectId, settings.defaultProvider).catch(() => {});

  const elapsed = Date.now() - start;
  logger.info({
    event: 'tweet_processed',
    tweetId: tweet.id,
    userId: tweet.authorId,
    agent: agentKey,
    provider: settings.defaultProvider,
    model: settings.defaultModel,
    elapsed,
    tokens: llmResponse.tokenUsage.total,
  });

  return { success: true, response: finalContent, agent: agentKey };
}
