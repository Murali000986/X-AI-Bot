import { TwitterApi } from 'twitter-api-v2';
import { XProvider, Tweet, XUser } from './XProvider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class XApiProvider implements XProvider {
  private readClient: TwitterApi;
  private writeClient: TwitterApi;

  constructor() {
    // Bearer token for reading (v2 app-auth)
    this.readClient = new TwitterApi(env.X_BEARER_TOKEN ?? '');

    // OAuth 1.0a user-context for writing replies
    this.writeClient = new TwitterApi({
      appKey: env.X_CLIENT_ID ?? '',
      appSecret: env.X_CLIENT_SECRET ?? '',
      accessToken: env.X_ACCESS_TOKEN ?? '',
      accessSecret: env.X_ACCESS_SECRET ?? '',
    });
  }

  async authenticate(): Promise<void> {
    try {
      const me = await this.writeClient.v2.me();
      logger.info(`X authenticated as @${me.data.username}`);
    } catch (err) {
      logger.error('X authentication failed:', err);
      throw err;
    }
  }

  async getMentions(sinceId?: string): Promise<Tweet[]> {
    try {
      const me = await this.writeClient.v2.me();
      const params: Record<string, unknown> = {
        'tweet.fields': ['author_id', 'text', 'referenced_tweets', 'in_reply_to_user_id'],
        'user.fields': ['name', 'username', 'profile_image_url'],
        expansions: ['author_id'],
        max_results: 10,
      };
      if (sinceId) params.since_id = sinceId;

      const mentions = await this.readClient.v2.userMentionTimeline(me.data.id, params);
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
    const reply = await this.writeClient.v2.tweet({
      text,
      reply: { in_reply_to_tweet_id: tweetId },
    });
    logger.info(`Replied to tweet ${tweetId} → new tweet ${reply.data.id}`);
    return reply.data.id;
  }

  async getUser(userId: string): Promise<XUser> {
    const user = await this.readClient.v2.user(userId, {
      'user.fields': ['name', 'username', 'profile_image_url'],
    });
    return {
      id: user.data.id,
      username: user.data.username,
      displayName: user.data.name,
      profileImage: (user.data as Record<string, unknown>)['profile_image_url'] as string | undefined,
    };
  }
}
