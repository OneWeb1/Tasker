import { createId } from '@/shared/lib/utils/createId';
import {
  exportAll,
  flushStorage,
  importAll,
  readPersistent,
  writePersistent,
} from '@/shared/lib/utils/storage';

export type BackupReason = 'reset' | 'restore';

export interface Backup {
  id: string;
  createdAt: number;
  reason: BackupReason;
  stats: { tasks: number; categories: number; notes: number };
  entries: Record<string, string>;
}

export type RestoreResult = 'ok' | 'invalid' | 'noSpace' | 'failed';

const BACKUPS_KEY = 'resetBackups';
const MAX_BACKUPS = 5;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isBackup = (value: unknown): value is Backup => {
  if (!isRecord(value)) return false;
  const { stats, entries } = value;
  return (
    typeof value.id === 'string' &&
    typeof value.createdAt === 'number' &&
    (value.reason === 'reset' || value.reason === 'restore') &&
    isRecord(stats) &&
    typeof stats.tasks === 'number' &&
    typeof stats.categories === 'number' &&
    typeof stats.notes === 'number' &&
    isRecord(entries) &&
    Object.values(entries).every((entry) => typeof entry === 'string')
  );
};

const isRestorable = (backup: Backup): boolean =>
  Object.values(backup.entries).every((entry) => {
    try {
      JSON.parse(entry);
      return true;
    } catch {
      return false;
    }
  });

const countItems = (raw: string | undefined): number => {
  if (!raw) return 0;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

export const readBackups = (): Backup[] => {
  const stored = readPersistent<unknown>(BACKUPS_KEY, []);
  return Array.isArray(stored) ? stored.filter(isBackup) : [];
};

export const createBackup = (reason: BackupReason): Backup | null => {
  const entries = exportAll();
  if (Object.keys(entries).length === 0) return null;

  const backup: Backup = {
    id: createId(),
    createdAt: Date.now(),
    reason,
    stats: {
      tasks: countItems(entries.tasks),
      categories: countItems(entries.categories),
      notes: countItems(entries.notes),
    },
    entries,
  };

  writePersistent(BACKUPS_KEY, [backup, ...readBackups()].slice(0, MAX_BACKUPS));
  return backup;
};

export const removeBackup = (id: string): void => {
  writePersistent(
    BACKUPS_KEY,
    readBackups().filter((backup) => backup.id !== id),
  );
};

export const clearBackups = (): void => {
  writePersistent(BACKUPS_KEY, []);
};

export const restoreBackup = async (backup: Backup): Promise<RestoreResult> => {
  if (!isRestorable(backup)) return 'invalid';

  try {
    createBackup('restore');
    await flushStorage();
  } catch {
    return 'noSpace';
  }

  try {
    await importAll(backup.entries);
    return 'ok';
  } catch {
    return 'failed';
  }
};