import { parseDateKey } from './dateKey';

const DAY_MS = 86_400_000;

export const diffDays = (fromKey: string, toKey: string): number =>
  Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / DAY_MS);