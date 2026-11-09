import type { TaskSubtask } from '@/entities/task';
import { guardJson, parseJsonObject } from '@/shared/lib/utils/json';
import type { ParseResult } from '@/shared/lib/utils/json';
import { readSubtask } from '../parseTaskJson/parseTaskJson';

export const parseSubtaskJson = (raw: string): ParseResult<TaskSubtask> => {
  const parsed = parseJsonObject(raw);
  if (!parsed.ok) return parsed;

  return guardJson(() => readSubtask(parsed.value));
};