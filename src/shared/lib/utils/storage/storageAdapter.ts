import { collectBlobGarbage, migrateDataUrls, setBlobDriver } from './blobs';
import { KEEP_PREFIX, STORAGE_PREFIX } from './constants';
import { createIndexedDbBlobDriver } from './drivers/indexedDbBlobDriver';
import { createIndexedDbDriver, openDatabase } from './drivers/indexedDbDriver';
import { localStorageDriver } from './drivers/localStorageDriver';
import { migrateFromLocalStorage } from './drivers/migrateFromLocalStorage';
import type { StorageChanges, StorageDriver } from './drivers/types';

const CHANNEL_NAME = 'tasker-storage';

const cache = new Map<string, string>();
let driver: StorageDriver = localStorageDriver;
let queue: Promise<void> = Promise.resolve();
let failure: { error: unknown } | null = null;
let channel: BroadcastChannel | null = null;

const applyToCache = ({ puts, deletes }: StorageChanges): void => {
  deletes.forEach((key) => cache.delete(key));
  puts.forEach(([key, value]) => cache.set(key, value));
};

const writeBehind = (changes: StorageChanges): void => {
  applyToCache(changes);
  queue = queue
    .then(async () => {
      await driver.apply(changes);
      channel?.postMessage(changes);
    })
    .catch((error: unknown) => {
      failure ??= { error };
    });
};

const commit = (changes: StorageChanges): Promise<void> => {
  const run = queue.then(async () => {
    await driver.apply(changes);
    applyToCache(changes);
    channel?.postMessage(changes);
  });
  queue = run.catch(() => undefined);
  return run;
};

const put = (key: string, value: string): void => {
  writeBehind({ puts: [[key, value]], deletes: [] });
};

const readJson = <T>(key: string, fallback: T): T => {
  const raw = cache.get(key);
  if (raw === undefined) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const listAppKeys = (): string[] =>
  [...cache.keys()].filter((key) => key.startsWith(STORAGE_PREFIX));

const prepareBlobs = async (): Promise<void> => {
  try {
    const changes = await migrateDataUrls(cache);
    if (changes.puts.length > 0) await commit(changes);
    await collectBlobGarbage(cache.values());
  } catch {
    // дані лишаються як є, наступний запуск повторить спробу
  }
};

export const initStorage = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    const indexedDb = createIndexedDbDriver(db);
    const loaded = await indexedDb.loadAll();
    await migrateFromLocalStorage(indexedDb, loaded);
    driver = indexedDb;
    setBlobDriver(createIndexedDbBlobDriver(db));
    loaded.forEach((value, key) => cache.set(key, value));
  } catch {
    driver = localStorageDriver;
    const loaded = await localStorageDriver.loadAll();
    loaded.forEach((value, key) => cache.set(key, value));
  }

  await prepareBlobs();

  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<StorageChanges>) => applyToCache(event.data);
  }
};

export const flushStorage = async (): Promise<void> => {
  await queue;
  if (failure) {
    const { error } = failure;
    failure = null;
    throw error;
  }
};

export const readCollection = <T>(collection: string, seed: readonly T[] = []): T[] => {
  const raw = cache.get(STORAGE_PREFIX + collection);
  if (raw === undefined) {
    const initial = [...seed];
    put(STORAGE_PREFIX + collection, JSON.stringify(initial));
    return initial;
  }
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
};

export const writeCollection = <T>(collection: string, items: T[]): void => {
  put(STORAGE_PREFIX + collection, JSON.stringify(items));
};

export const readValue = <T>(key: string, fallback: T): T =>
  readJson(STORAGE_PREFIX + key, fallback);

export const writeValue = <T>(key: string, value: T): void => {
  put(STORAGE_PREFIX + key, JSON.stringify(value));
};

export const readPersistent = <T>(key: string, fallback: T): T =>
  readJson(KEEP_PREFIX + key, fallback);

export const writePersistent = <T>(key: string, value: T): void => {
  put(KEEP_PREFIX + key, JSON.stringify(value));
};

export const clearStorage = (): void => {
  writeBehind({ puts: [], deletes: listAppKeys() });
};

export const exportAll = (): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const [key, value] of cache) {
    if (key.startsWith(STORAGE_PREFIX)) entries[key.slice(STORAGE_PREFIX.length)] = value;
  }
  return entries;
};

export const importAll = (entries: Readonly<Record<string, string>>): Promise<void> =>
  commit({
    deletes: listAppKeys(),
    puts: Object.entries(entries).map(([key, value]) => [STORAGE_PREFIX + key, value] as const),
  });