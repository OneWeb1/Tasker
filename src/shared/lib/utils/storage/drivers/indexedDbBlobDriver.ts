import { BLOB_STORE_NAME } from './indexedDbDriver';
import type { BlobDriver } from './types';

const run = <T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T> | undefined,
): Promise<T | undefined> =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(BLOB_STORE_NAME, mode);
    const request = work(transaction.objectStore(BLOB_STORE_NAME));

    transaction.oncomplete = () => resolve(request?.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

export const createIndexedDbBlobDriver = (db: IDBDatabase): BlobDriver => ({
  put: async (id, blob) => {
    await run(db, 'readwrite', (store) => store.put(blob, id));
  },
  get: async (id) => {
    const result = await run<unknown>(db, 'readonly', (store) => store.get(id));
    return result instanceof Blob ? result : null;
  },
  keys: async () => {
    const keys = await run(db, 'readonly', (store) => store.getAllKeys());
    return (keys ?? []).map(String);
  },
  delete: async (ids) => {
    await run(db, 'readwrite', (store) => {
      ids.forEach((id) => store.delete(id));
      return undefined;
    });
  },
});