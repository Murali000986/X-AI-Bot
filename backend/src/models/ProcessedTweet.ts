import mongoose, { Document, Schema } from 'mongoose';

export interface IProcessedTweet extends Document {
  tweetId: string;
  userId: string;
  processedAt: Date;
}

const ProcessedTweetSchema = new Schema<IProcessedTweet>({
  tweetId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

// auto-expire after 30 days to keep collection lean
ProcessedTweetSchema.index({ processedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const ProcessedTweet = mongoose.model<IProcessedTweet>('ProcessedTweet', ProcessedTweetSchema);
