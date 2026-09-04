import { logger } from '../utils/logger';

export interface ModerationResult {
  passed: boolean;
  reason?: string;
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|above|prior)\s+instructions/i,
  /disregard\s+your\s+(?:system\s+)?prompt/i,
  /you\s+are\s+now\s+(?:a\s+)?(?:dan|jailbreak|evil|unrestricted)/i,
  /forget\s+(?:everything|all)\s+(?:you\s+)?(?:know|were\s+told)/i,
  /act\s+as\s+if\s+you\s+have\s+no\s+restrictions/i,
];

const SPAM_PATTERNS = [
  /(.)\1{20,}/,           // 20+ repeated chars
  /(\b\w+\b)(\s+\1){5,}/, // same word 5+ times
];

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

export function moderateInput(text: string): ModerationResult {
  if (!text || text.trim().length < MIN_MESSAGE_LENGTH) {
    return { passed: false, reason: 'Message is empty.' };
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return { passed: false, reason: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` };
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return { passed: false, reason: 'Message looks like spam.' };
    }
  }

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      logger.warn('Prompt injection attempt detected');
      return { passed: false, reason: 'Invalid request.' };
    }
  }

  return { passed: true };
}

export function moderateOutput(text: string): ModerationResult {
  // Basic output safety: ensure no internal markers leaked
  if (/SYSTEM:|<system>|<\/?prompt>/i.test(text)) {
    logger.error('Output moderation: internal marker detected in LLM response');
    return { passed: false, reason: 'Response filtered for safety.' };
  }
  return { passed: true };
}
