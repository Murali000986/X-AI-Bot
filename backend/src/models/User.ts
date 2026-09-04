import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  xUserId: string;
  username: string;
  displayName: string;
  profileImage?: string;
  createdAt: Date;
  lastActive: Date;
  messageCount: number;
  isBlocked: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    xUserId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    profileImage: { type: String },
    lastActive: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
