import { TwitterApi } from 'twitter-api-v2';
import { XProvider, Tweet, XUser } from './XProvider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getSettings } from '../../models/BotSettings';

export class XApiProvider implements XProvider {

  private async getClients() {
    const settings = await getSettings();
    const bearer = settings.xBearerToken || env.X_BEARER_TOKEN || '';
    const appKey = settings.xAppKey || env.X_CLIENT_ID || '';
    const appSecret = settings.xAppSecret || env.X_CLIENT_SECRET || '';
    const accessToken = settings.xAccessToken || env.X_ACCESS_TOKEN || '';
    const accessSecret = settings.xAccessSecret || env.X_ACCESS_SECRET || '';

    const readClient = new TwitterApi(bearer);
    const writeClient = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });
    return { readClient, writeClient };
  }

  async authenticate(): Promise<void> {
    try {
      const { writeClient } = await this.getClients();
      const me = await writeClient.v2.me();
      logger.info(`X authenticated as @${me.data.username}`);
    } catch (err) {
      logger.error('X authentication failed:', err);
      throw err;
    }
  }

  async getMentions(sinceId?: string): Promise<Tweet[]> {
    try {
      const { readClient, writeClient } = await this.getClients();
      const me = await writeClient.v2.me();
      const params: Record<string, unknown> = {
        'tweet.fields': ['author_id', 'text', 'referenced_tweets', 'in_reply_to_user_id'],
        'user.fields': ['name', 'username', 'profile_image_url'],
        expansions: ['author_id'],
        max_results: 10,
      };
      if (sinceId) params.since_id = sinceId;

      const mentions = await readClient.v2.userMentionTimeline(me.data.id, params);
      const users: Map<string, { username: string; name: string; profile_image_url?: string }> = new Map();

      for (const user of mentions.data.includes?.users ?? []) {
        users.set(user.id, { username: user.username, name: user.name, profile_image_url: user.profile_image_url });
      }

      return (mentions.data.data ?? []).map((tweet) => {
        const author = users.get(tweet.author_id ?? '');
        return {
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id ?? '',
          username: author?.username ?? '',
          displayName: author?.name ?? '',
          profileImage: author?.profile_image_url,
          replyToTweetId: tweet.referenced_tweets?.[0]?.id,
        };
      });
    } catch (err) {
      logger.error('getMentions failed:', err);
      return [];
    }
  }

  async replyToTweet(tweetId: string, text: string): Promise<string> {
    const { writeClient } = await this.getClients();
    const reply = await writeClient.v2.tweet({
      text,
      reply: { in_reply_to_tweet_id: tweetId },
    });
    logger.info(`Replied to tweet ${tweetId} → new tweet ${reply.data.id}`);
    return reply.data.id;
  }

  async getUser(userId: string): Promise<XUser> {
    const { readClient } = await this.getClients();
    const user = await readClient.v2.user(userId, {
      'user.fields': ['name', 'username', 'profile_image_url'],
    });
    return {
      id: user.data.id,
      username: user.data.username,
      displayName: user.data.name,
      profileImage: (user.data as any).profile_image_url,
    };
  }

  async getMe(): Promise<XUser> {
    try {
      const { readClient } = await this.getClients();
      const me = await readClient.v2.me({
        'user.fields': ['profile_image_url', 'public_metrics']
      });
      return {
        id: me.data.id,
        username: me.data.username,
        displayName: me.data.name,
        profileImage: (me.data as any).profile_image_url,
        followersCount: (me.data as any).public_metrics?.followers_count,
        followingCount: (me.data as any).public_metrics?.following_count,
        tweetCount: (me.data as any).public_metrics?.tweet_count,
      };
    } catch (err) {
      logger.error('getMe failed:', err);
      throw err;
    }
  }
}
