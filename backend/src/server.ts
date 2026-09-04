import { createApp } from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import { logger } from './utils/logger';
import { XApiProvider } from './services/x/XApiProvider';
import { processTweet } from './services/MessageProcessor';

const POLL_INTERVAL_MS = 60_000; // 60s — stays within free tier rate limits

async function startPolling() {
  const xProvider = new XApiProvider();
  let lastSeenId: string | undefined;

  // Probe X API before committing to the loop
  const probe = await xProvider.getMentions(undefined).catch((err: unknown) => err);
  if (probe instanceof Error) {
    const msg = probe.message ?? '';
    if (msg.includes('402')) {
      logger.warn('X API returned 402 (free tier — read access not included). Polling disabled. Use /api/test-agent to test AI locally.');
    } else {
      logger.warn('X API probe failed, polling disabled:', msg);
    }
    return; // don't start the interval
  }

  logger.info('🔄 Mention poller started (60s interval)');

  const poll = async () => {
    try {
      const mentions = await xProvider.getMentions(lastSeenId);
      if (mentions.length > 0) {
        logger.info(`Poller: ${mentions.length} new mention(s)`);
        lastSeenId = mentions[0].id;
        for (const tweet of [...mentions].reverse()) {
          await processTweet(tweet).catch((err) =>
            logger.error(`Failed to process tweet ${tweet.id}:`, err)
          );
        }
      }
    } catch (err) {
      logger.warn('Poller fetch failed (will retry):', err);
    }
  };

  await poll();
  setInterval(poll, POLL_INTERVAL_MS);
}

async function start() {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const port = parseInt(env.PORT);

  app.listen(port, () => {
    logger.info(`🚀 X AI Chatbot backend running on port ${port}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  // X API polling disabled to prevent twitter-api-v2 unhandled exceptions on free tier
  // startPolling().catch((err) => logger.error('Poller startup failed:', err));

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down...');
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
