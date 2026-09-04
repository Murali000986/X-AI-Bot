import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

// Fail fast: don't buffer operations when DB is disconnected
mongoose.set('bufferCommands', false);

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      bufferCommands: false,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed. Continuing in degraded mode.');
    await mongoose.disconnect().catch(() => {}); // stop reconnect retries
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
