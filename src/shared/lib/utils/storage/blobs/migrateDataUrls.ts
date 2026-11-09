import { dataUrlToBlob } from '@/shared/lib/utils/dataUrl';
import { STORAGE_PREFIX } from '../constants';
import type { StorageChanges } from '../drivers/types';
import { storeBlob } from './blobStore';

const DATA_URL_MARKER = '"dataUrl"';

type FileRecord = Record<string, unknown> & { dataUrl: string };

const isFileRecord = (value: Record<string, unknown>): value is FileRecord =>
  typeof value.dataUrl === 'string' &&
  value.dataUrl.startsWith('data:') &&
  typeof value.name === 'string' &&
  typeof value.type === 'string' &&
  typeof value.size === 'number';

const migrateRecord = async (record: FileRecord): Promise<unknown> => {
  const { dataUrl, ...rest } = record;
  try {
    return { ...rest, blobId: await storeBlob(dataUrlToBlob(dataUrl)) };
  } catch {
    return record;
  }
};

const convert = async (node: unknown): Promise<unknown> => {
  if (Array.isArray(node)) {
    const result: unknown[] = [];
    for (const item of node) result.push(await convert(item));
    return result;
  }
  if (typeof node !== 'object' || node === null) return node;

  const record = node as Record<string, unknown>;
  if (isFileRecord(record)) return migrateRecord(record);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) result[key] = await convert(value);
  return result;
};

export const migrateDataUrls = async (
  entries: ReadonlyMap<string, string>,
): Promise<StorageChanges> => {
  const puts: [string, string][] = [];

  for (const [key, raw] of entries) {
    if (!key.startsWith(STORAGE_PREFIX) || !raw.includes(DATA_URL_MARKER)) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    puts.push([key, JSON.stringify(await convert(parsed))]);
  }

  return { puts, deletes: [] };
};