import { localStorageBlobDriver } from '../drivers/localStorageBlobDriver';
import type { BlobDriver } from '../drivers/types';
import { collectBlobIds, createBlobId, getBlobCreatedAt } from './blobId';

const GARBAGE_GRACE_MS = 60 * 60 * 1000;

let driver: BlobDriver = localStorageBlobDriver;

export const setBlobDriver = (next: BlobDriver): void => {
  driver = next;
};

export const storeBlob = async (blob: Blob): Promise<string> => {
  const id = createBlobId();
  await driver.put(id, blob);
  return id;
};

export const getBlob = (id: string): Promise<Blob | null> => driver.get(id);

export const collectBlobGarbage = async (values: Iterable<string>): Promise<void> => {
  const referenced = collectBlobIds(values);
  const threshold = Date.now() - GARBAGE_GRACE_MS;
  const orphans = (await driver.keys()).filter(
    (id) => !referenced.has(id) && getBlobCreatedAt(id) < threshold,
  );
  if (orphans.length > 0) await driver.delete(orphans);
};