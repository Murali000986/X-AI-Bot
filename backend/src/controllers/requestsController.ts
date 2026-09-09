import { Request, Response } from 'express';
import { Message } from '../models/Message';

// Per-model cost per 1M tokens (USD) — approximate
const COST_TABLE: Record<string, { prompt: number; completion: number }> = {
  'gpt-4o':             { prompt: 5,     completion: 15 },
  'gpt-4o-mini':        { prompt: 0.15,  completion: 0.60 },
  'gpt-3.5-turbo':      { prompt: 0.5,   completion: 1.5 },
  'gemini-1.5-flash':   { prompt: 0.075, completion: 0.30 },
  'gemini-1.5-pro':     { prompt: 3.5,   completion: 10.5 },
  'gemini-2.0-flash':   { prompt: 0.10,  completion: 0.40 },
  'llama3-8b-8192':     { prompt: 0.05,  completion: 0.08 },
  'llama3-70b-8192':    { prompt: 0.59,  completion: 0.79 },
  'mixtral-8x7b-32768': { prompt: 0.24,  completion: 0.24 },
};

function estimateCost(model: string, prompt: number, completion: number): number {
  const rates = COST_TABLE[model];
  if (!rates) return 0;
  return (prompt * rates.prompt + completion * rates.completion) / 1_000_000;
}

export async function getRequests(req: Request, res: Response): Promise<void> {
  const page  = Math.max(1, parseInt(String(req.query.page ?? '1')));
  const limit = Math.min(100, parseInt(String(req.query.limit ?? '50')));
  const skip  = (page - 1) * limit;

  const filter: Record<string, unknown> = { role: 'assistant', 'tokenUsage.total': { $exists: true } };
  if (req.query.model)     filter['model'] = req.query.model;
  if (req.query.agent)     filter['agent'] = req.query.agent;
  if (req.query.from || req.query.to) {
    const dateFilter: Record<string, Date> = {};
    if (req.query.from) dateFilter['$gte'] = new Date(String(req.query.from));
    if (req.query.to)   dateFilter['$lte'] = new Date(String(req.query.to));
    filter['createdAt'] = dateFilter;
  }

  try {
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username displayName')
        .lean(),
      Message.countDocuments(filter),
    ]);

    const requests = messages.map((m) => {
      const prompt     = m.tokenUsage?.prompt     ?? 0;
      const completion = m.tokenUsage?.completion ?? 0;
      const total      = m.tokenUsage?.total      ?? 0;
      const cost       = estimateCost(m.model ?? '', prompt, completion);
      return {
        _id:       m._id,
        createdAt: m.createdAt,
        userId:    m.userId,
        agent:     m.agent,
        model:     m.model,
        tweetId:   m.tweetId,
        tokenUsage: { prompt, completion, total },
        costUSD:   parseFloat(cost.toFixed(6)),
        content:   m.content,
      };
    });

    res.json({ requests, total, page, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
}

export async function getRequestStats(_req: Request, res: Response): Promise<void> {
  try {
    const agg = await Message.aggregate([
      { $match: { role: 'assistant', 'tokenUsage.total': { $exists: true } } },
      {
        $group: {
          _id:               '$model',
          count:             { $sum: 1 },
          promptTokens:      { $sum: '$tokenUsage.prompt' },
          completionTokens:  { $sum: '$tokenUsage.completion' },
          totalTokens:       { $sum: '$tokenUsage.total' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const stats = agg.map((row) => ({
      model:            row._id,
      count:            row.count,
      promptTokens:     row.promptTokens,
      completionTokens: row.completionTokens,
      totalTokens:      row.totalTokens,
      costUSD:          parseFloat(
        estimateCost(row._id ?? '', row.promptTokens, row.completionTokens).toFixed(4)
      ),
    }));

    const totals = stats.reduce(
      (acc, s) => ({
        count:    acc.count    + s.count,
        tokens:   acc.tokens   + s.totalTokens,
        costUSD:  acc.costUSD  + s.costUSD,
      }),
      { count: 0, tokens: 0, costUSD: 0 }
    );

    res.json({ byModel: stats, totals: { ...totals, costUSD: parseFloat(totals.costUSD.toFixed(4)) } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch request stats' });
  }
}
