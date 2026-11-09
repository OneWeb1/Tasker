import { formatDuration } from '@/shared/lib/utils/date';

const MS_IN_MINUTE = 60_000;

export const formatSpent = (durationMs: number): string =>
  formatDuration(Math.max(1, Math.round(durationMs / MS_IN_MINUTE)));