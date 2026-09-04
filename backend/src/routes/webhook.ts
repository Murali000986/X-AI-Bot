import { Router, Request, Response } from 'express';
import { processTweet } from '../services/MessageProcessor';
import { XApiProvider } from '../services/x/XApiProvider';
import { logger } from '../utils/logger';

const router = Router();
const xProvider = new XApiProvider();

// Polling-based mention fetcher (runs on demand via POST /webhook/poll)
// In production, replace with X Account Activity API webhook
let lastSinceId: string | undefined;

router.post('/poll', async (_req: Request, res: Response) => {
  try {
    const mentions = await xProvider.getMentions(lastSinceId);
    if (mentions.length > 0) {
      lastSinceId = mentions[0].id; // X returns newest first
      logger.info(`Processing ${mentions.length} new mentions`);
      for (const tweet of mentions) {
        processTweet(tweet).catch((err) => logger.error(`Failed to process tweet ${tweet.id}:`, err));
      }
    }
    res.json({ processed: mentions.length });
  } catch (err) {
    logger.error('Webhook poll failed:', err);
    res.status(500).json({ error: 'Poll failed' });
  }
});

// X Account Activity API webhook challenge (CRC)
router.get('/x', (req: Request, res: Response) => {
  const crcToken = req.query.crc_token as string;
  if (!crcToken) { res.status(400).json({ error: 'crc_token missing' }); return; }

  const crypto = require('crypto');
  const secret = process.env.X_WEBHOOK_SECRET ?? '';
  const hmac = crypto.createHmac('sha256', secret).update(crcToken).digest('base64');
  res.json({ response_token: `sha256=${hmac}` });
});

// X Account Activity API webhook — incoming events
router.post('/x', async (req: Request, res: Response) => {
  res.sendStatus(200); // acknowledge immediately
  const body = req.body as Record<string, unknown>;

  const tweetCreateEvents = body['tweet_create_events'] as Array<Record<string, unknown>> | undefined;
  if (!tweetCreateEvents) return;

  for (const event of tweetCreateEvents) {
    const user = event['user'] as Record<string, unknown>;
    await processTweet({
      id: String(event['id_str']),
      text: String(event['full_text'] ?? event['text']),
      authorId: String(user['id_str']),
      username: String(user['screen_name']),
      displayName: String(user['name']),
      profileImage: user['profile_image_url_https'] as string | undefined,
    }).catch((err) => logger.error('Event processing error:', err));
  }
});

export default router;
