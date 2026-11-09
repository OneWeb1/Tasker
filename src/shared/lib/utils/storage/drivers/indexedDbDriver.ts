import type { StorageChanges, StorageDriver } from './types';

const DB_NAME = 'tasker';
const STORE_NAME = 'kv';
export const BLOB_STORE_NAME = 'blobs';
const DB_VERSION = 2;

export const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const { result } = request;
      if (!result.objectStoreNames.contains(STORE_NAME)) result.createObjectStore(STORE_NAME);
      if (!result.objectStoreNames.contains(BLOB_STORE_NAME)) {
        result.createObjectStore(BLOB_STORE_NAME);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });

const loadAll = (db: IDBDatabase): Promise<Map<string, string>> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const keys = store.getAllKeys();
    const values = store.getAll();

    transaction.oncomplete = () => {
      const entries = new Map<string, string>();
      keys.result.forEach((key, index) => entries.set(String(key), String(values.result[index])));
      resolve(entries);
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

const apply = (db: IDBDatabase, { puts, deletes }: StorageChanges): Promise<void> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    deletes.forEach((key) => store.delete(key));
    puts.forEach(([key, value]) => store.put(value, key));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

export const createIndexedDbDriver = (db: IDBDatabase): StorageDriver => ({
  loadAll: () => loadAll(db),
  apply: (changes) => apply(db, changes),
});