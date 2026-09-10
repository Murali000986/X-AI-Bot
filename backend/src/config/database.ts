import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
  // bufferCommands = true (Mongoose default) — queries queue until the
  // connection is established. This prevents the "Cannot call before initial
  // connection" error when Atlas takes a moment to accept the connection.
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,  // Give Atlas 15s to respond
      socketTimeoutMS: 45000,
    });
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('MongoDB initial connection failed — will keep retrying:', err);
    // Do NOT call mongoose.disconnect() here — Mongoose will keep retrying
    // automatically on subsequent operations. Calling disconnect() would
    // permanently kill the connection and produce the bufferCommands error.
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
