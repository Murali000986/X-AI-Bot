import { Request, Response } from 'express';
import { User } from '../models/User';
import { Message } from '../models/Message';

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalUsers, totalMessages, messagesToday, activeUsers, tokenAgg] = await Promise.all([
      User.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ lastActive: { $gte: since24h } }),
      Message.aggregate([
        { $match: { role: 'assistant', 'tokenUsage.total': { $exists: true } } },
        { $group: { _id: null, totalTokens: { $sum: '$tokenUsage.total' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalMessages,
      messagesToday,
      activeUsers,
      totalTokens: tokenAgg[0]?.totalTokens ?? 0,
      llmRequests: tokenAgg[0]?.count ?? 0,
    });
  } catch {
    res.json({
      totalUsers: 0, totalMessages: 0, messagesToday: 0,
      activeUsers: 0, totalTokens: 0, llmRequests: 0,
    });
  }
}
