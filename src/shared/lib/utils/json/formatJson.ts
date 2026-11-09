import { parseJsonObject } from './parseJsonObject';
import type { ParseResult } from './parseJsonObject';

export const formatJson = (raw: string): ParseResult<string> => {
  const parsed = parseJsonObject(raw);
  if (!parsed.ok) return parsed;

  return { ok: true, value: JSON.stringify(parsed.value, null, 2) };
};