import { readLocalStorageEntries } from './localStorageDriver';
import type { StorageDriver } from './types';

const MIGRATED_KEY = 'meta:migrated';

export const migrateFromLocalStorage = async (
  driver: StorageDriver,
  loaded: Map<string, string>,
): Promise<void> => {
  if (loaded.has(MIGRATED_KEY)) return;

  const legacy = readLocalStorageEntries();
  const puts: [string, string][] = [...legacy, [MIGRATED_KEY, '1']];
  await driver.apply({ puts, deletes: [] });

  puts.forEach(([key, value]) => loaded.set(key, value));
  legacy.forEach((_, key) => window.localStorage.removeItem(key));
};