import { isRecord } from './parseJsonObject';
import type { ParseResult } from './parseJsonObject';

export class JsonFieldError extends Error {}

type JsonSource = Record<string, unknown>;

export const readOptionalString = (source: JsonSource, key: string): string | undefined => {
  const value = source[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw new JsonFieldError(`Поле "${key}" має бути рядком`);
  return value;
};

export const readRequiredString = (source: JsonSource, key: string): string => {
  const value = readOptionalString(source, key)?.trim();
  if (!value) throw new JsonFieldError(`Поле "${key}" обов’язкове`);
  return value;
};

export const readOptionalBoolean = (source: JsonSource, key: string): boolean | undefined => {
  const value = source[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'boolean') {
    throw new JsonFieldError(`Поле "${key}" має бути true або false`);
  }
  return value;
};

export const readOptionalArray = (source: JsonSource, key: string): unknown[] | undefined => {
  const value = source[key];
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new JsonFieldError(`Поле "${key}" має бути масивом`);
  return value;
};

export const readRecord = (value: unknown, label: string): JsonSource => {
  if (!isRecord(value)) throw new JsonFieldError(`Очікувався об’єкт: ${label}`);
  return value;
};

export const guardJson = <T>(read: () => T): ParseResult<T> => {
  try {
    return { ok: true, value: read() };
  } catch (error) {
    if (error instanceof JsonFieldError) return { ok: false, error: error.message };
    throw error;
  }
};