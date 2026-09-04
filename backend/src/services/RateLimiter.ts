import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  reason?: string;
}

async function slidingWindow(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const now = Date.now();
  const windowStart = now - windowMs;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, '-inf', windowStart); // remove expired
  pipeline.zcard(key);                                  // count current
  pipeline.zadd(key, now, `${now}`);                   // add this request
  pipeline.expire(key, Math.ceil(windowMs / 1000));

  const results = await pipeline.exec();
  const count = (results?.[1]?.[1] as number) ?? 0;

  const allowed = count < limit;
  const remaining = Math.max(0, limit - count - 1);
  const resetInSeconds = Math.ceil(windowMs / 1000);

  return { allowed, remaining, resetInSeconds };
}

export async function checkUserRateLimit(userId: string, limitPerMin = 5): Promise<RateLimitResult> {
  const result = await slidingWindow(`rl:user:${userId}`, limitPerMin, 60_000);
  if (!result.allowed) {
    logger.warn(`Rate limit hit for user ${userId}`);
    result.reason = `You've reached the limit of ${limitPerMin} requests per minute. Please wait ${result.resetInSeconds}s.`;
  }
  return result;
}

export async function checkIpRateLimit(ip: string, limitPerMin = 20): Promise<RateLimitResult> {
  const result = await slidingWindow(`rl:ip:${ip}`, limitPerMin, 60_000);
  if (!result.allowed) {
    result.reason = 'Too many requests from your network. Please try again shortly.';
  }
  return result;
}

export async function checkGlobalRateLimit(limitPerMin: number): Promise<RateLimitResult> {
  const result = await slidingWindow('rl:global', limitPerMin, 60_000);
  if (!result.allowed) {
    result.reason = 'Bot is currently busy. Please try again in a moment.';
  }
  return result;
}
