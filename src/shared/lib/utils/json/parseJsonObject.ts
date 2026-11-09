export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const CODE_FENCE_PATTERN = /^```[\w-]*[ \t]*\r?\n([\s\S]*?)\r?\n?```$/;

const stripCodeFence = (text: string): string => CODE_FENCE_PATTERN.exec(text)?.[1].trim() ?? text;

export const parseJsonObject = (raw: string): ParseResult<Record<string, unknown>> => {
  const text = stripCodeFence(raw.trim());
  if (!text) return { ok: false, error: 'Вставте JSON' };

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Некоректний JSON' };
  }

  if (!isRecord(data)) return { ok: false, error: 'JSON має бути об’єктом' };
  return { ok: true, value: data };
};