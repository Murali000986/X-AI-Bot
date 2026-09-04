const X_CHAR_LIMIT = 280;
const TRUNCATION_SUFFIX = '… [truncated]';

/**
 * Formats an LLM response for posting on X.
 * - Strips excessive markdown
 * - Truncates to X character limit
 */
export function formatForX(text: string, maxLength = X_CHAR_LIMIT): string {
  let formatted = text
    .replace(/#{1,6}\s+/g, '')          // remove markdown headings
    .replace(/\*\*(.*?)\*\*/g, '$1')    // remove bold
    .replace(/\*(.*?)\*/g, '$1')        // remove italic
    .replace(/`{3}[\s\S]*?`{3}/g, (match) => {
      // Keep code blocks but strip the fences
      return match.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
    })
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links, keep text
    .replace(/\n{3,}/g, '\n\n')              // collapse excessive newlines
    .trim();

  if (formatted.length <= maxLength) return formatted;

  // Truncate at word boundary
  const truncated = formatted.slice(0, maxLength - TRUNCATION_SUFFIX.length);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + TRUNCATION_SUFFIX;
}

/** Splits text into X-sized chunks for thread replies. Returns array of strings. */
export function splitIntoChunks(text: string, maxLength = X_CHAR_LIMIT): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxLength) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}
