import { Request, Response } from 'express';
import { User } from '../models/User';
import { Conversation } from '../models/Conversation';

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(String(req.query.page ?? '1'));
    const limit = parseInt(String(req.query.limit ?? '20'));
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().sort({ lastActive: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.json({ users: [], total: 0, page: 1, pages: 0 });
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}

export async function blockUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ message: `User @${user.username} blocked`, user });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}

export async function unblockUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ message: `User @${user.username} unblocked`, user });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}

export async function getUserConversations(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const convs = await Conversation.find({ userId: user._id }).sort({ updatedAt: -1 }).lean();
    res.json(convs);
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}

