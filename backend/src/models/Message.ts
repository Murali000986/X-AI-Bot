import mongoose, { Document, Schema } from 'mongoose';

export interface ITokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  model?: string;
  tokenUsage?: ITokenUsage;
  tweetId?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    agent: { type: String },
    model: { type: String },
    tokenUsage: {
      prompt: { type: Number },
      completion: { type: Number },
      total: { type: Number },
    },
    tweetId: { type: String },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
