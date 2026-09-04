import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';

export async function getConversations(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(String(req.query.page ?? '1'));
    const limit = parseInt(String(req.query.limit ?? '20'));
    const skip = (page - 1) * limit;
    const [conversations, total] = await Promise.all([
      Conversation.find().sort({ updatedAt: -1 }).skip(skip).limit(limit)
        .populate('userId', 'username displayName xUserId').lean(),
      Conversation.countDocuments(),
    ]);
    res.json({ conversations, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.json({ conversations: [], total: 0, page: 1, pages: 0 });
  }
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    const conv = await Conversation.findById(req.params.id)
      .populate('userId', 'username displayName xUserId').lean();
    if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return; }
    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ createdAt: 1 }).lean();
    res.json({ conversation: conv, messages });
  } catch {
    res.status(503).json({ error: 'Database unavailable' });
  }
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(String(req.query.page ?? '1'));
    const limit = parseInt(String(req.query.limit ?? '50'));
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      Message.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('userId', 'username displayName').lean(),
      Message.countDocuments(),
    ]);
    res.json({ messages, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.json({ messages: [], total: 0, page: 1, pages: 0 });
  }
}
