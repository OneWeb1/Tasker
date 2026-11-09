import { APP_PREFIXES } from '../constants';
import type { StorageDriver } from './types';

const isAppKey = (key: string): boolean => APP_PREFIXES.some((prefix) => key.startsWith(prefix));

export const readLocalStorageEntries = (): Map<string, string> => {
  const entries = new Map<string, string>();
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !isAppKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) entries.set(key, value);
  }
  return entries;
};

export const localStorageDriver: StorageDriver = {
  loadAll: async () => readLocalStorageEntries(),
  apply: async ({ puts, deletes }) => {
    deletes.forEach((key) => window.localStorage.removeItem(key));
    puts.forEach(([key, value]) => window.localStorage.setItem(key, value));
  },
};