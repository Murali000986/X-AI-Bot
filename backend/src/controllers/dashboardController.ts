import { Request, Response } from 'express';
import { User } from '../models/User';
import { Message } from '../models/Message';

const COST_TABLE: Record<string, { prompt: number; completion: number }> = {
  'gpt-4o':           { prompt: 5,     completion: 15 },
  'gpt-4o-mini':      { prompt: 0.15,  completion: 0.60 },
  'gemini-1.5-flash': { prompt: 0.075, completion: 0.30 },
  'gemini-1.5-pro':   { prompt: 3.5,   completion: 10.5 },
  'gemini-2.0-flash': { prompt: 0.10,  completion: 0.40 },
  'llama3-8b-8192':   { prompt: 0.05,  completion: 0.08 },
  'llama3-70b-8192':  { prompt: 0.59,  completion: 0.79 },
};

function estimateTotalCost(agg: { model: string; promptTokens: number; completionTokens: number }[]): number {
  return agg.reduce((sum, r) => {
    const rates = COST_TABLE[r.model];
    if (!rates) return sum;
    return sum + (r.promptTokens * rates.prompt + r.completionTokens * rates.completion) / 1_000_000;
  }, 0);
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalUsers, totalMessages, messagesToday, activeUsers, tokenAgg, costAgg] = await Promise.all([
      User.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ lastActive: { $gte: since24h } }),
      Message.aggregate([
        { $match: { role: 'assistant', 'tokenUsage.total': { $exists: true } } },
        { $group: { _id: null, totalTokens: { $sum: '$tokenUsage.total' }, count: { $sum: 1 } } },
      ]),
      Message.aggregate([
        { $match: { role: 'assistant', 'tokenUsage.total': { $exists: true } } },
        { $group: { _id: '$model', promptTokens: { $sum: '$tokenUsage.prompt' }, completionTokens: { $sum: '$tokenUsage.completion' } } },
      ]),
    ]);

    const costRows = costAgg.map((r: { _id: string; promptTokens: number; completionTokens: number }) => ({
      model: r._id, promptTokens: r.promptTokens, completionTokens: r.completionTokens,
    }));
    res.json({
      totalUsers,
      totalMessages,
      messagesToday,
      activeUsers,
      totalTokens: tokenAgg[0]?.totalTokens ?? 0,
      llmRequests: tokenAgg[0]?.count ?? 0,
      totalCostUSD: parseFloat(estimateTotalCost(costRows).toFixed(4)),
    });
  } catch {
    res.json({
      totalUsers: 0, totalMessages: 0, messagesToday: 0,
      activeUsers: 0, totalTokens: 0, llmRequests: 0, totalCostUSD: 0,
    });
  }
}
