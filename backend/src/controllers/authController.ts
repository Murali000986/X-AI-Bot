import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Admin credentials stored in env (hashed at startup)
let hashedPassword: string | null = null;

async function getHashedPassword(): Promise<string> {
  if (!hashedPassword) {
    hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  }
  return hashedPassword;
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  if (username !== env.ADMIN_USERNAME) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Compare against env password
  const valid = await bcrypt.compare(password, await getHashedPassword());
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ username }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  res.json({ token, expiresIn: env.JWT_EXPIRES_IN });
}
