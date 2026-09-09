import { Request, Response } from 'express';
import mongoose from 'mongoose';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const mem  = process.memoryUsage();
  const uptime = process.uptime();

  // MongoDB status
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'ok' : dbState === 2 ? 'connecting' : 'error';

  // Redis — try to ping if client available (optional dep)
  let redisStatus: 'ok' | 'error' | 'unconfigured' = 'unconfigured';
  try {
    // Dynamic import so it doesn't crash if redis module not present
    const { getRedisClient } = await import('../config/redis');
    const redis = getRedisClient();
    if (redis) {
      await (redis as { ping: () => Promise<string> }).ping();
      redisStatus = 'ok';
    }
  } catch {
    redisStatus = 'error';
  }

  res.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    services: {
      database: dbStatus,
      redis:    redisStatus,
    },
    memory: {
      rss:       Math.round(mem.rss / 1024 / 1024),
      heapUsed:  Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    },
  });
}
