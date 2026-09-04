import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  const days = parseInt(String(req.query.days ?? '7'));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [messagesPerDay, usersPerDay, agentUsage, providerUsage, tokenPerDay] = await Promise.all([
      Message.aggregate([
        { $match: { createdAt: { $gte: since }, role: 'user' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Message.aggregate([
        { $match: { role: 'assistant', agent: { $exists: true }, createdAt: { $gte: since } } },
        { $group: { _id: '$agent', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Message.aggregate([
        { $match: { role: 'assistant', model: { $exists: true }, createdAt: { $gte: since } } },
        { $group: { _id: '$model', count: { $sum: 1 }, tokens: { $sum: '$tokenUsage.total' } } },
        { $sort: { count: -1 } },
      ]),
      Message.aggregate([
        { $match: { role: 'assistant', 'tokenUsage.total': { $exists: true }, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, tokens: { $sum: '$tokenUsage.total' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({ messagesPerDay, usersPerDay, agentUsage, providerUsage, tokenPerDay });
  } catch {
    res.json({ messagesPerDay: [], usersPerDay: [], agentUsage: [], providerUsage: [], tokenPerDay: [] });
  }
}
