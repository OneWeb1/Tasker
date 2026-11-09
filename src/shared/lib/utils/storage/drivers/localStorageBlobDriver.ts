import { dataUrlToBlob } from '@/shared/lib/utils/dataUrl';
import { readFileAsDataUrl } from '@/shared/lib/utils/readFileAsDataUrl';
import { BLOB_PREFIX } from '../constants';
import type { BlobDriver } from './types';

export const localStorageBlobDriver: BlobDriver = {
  put: async (id, blob) => {
    window.localStorage.setItem(BLOB_PREFIX + id, await readFileAsDataUrl(blob));
  },
  get: async (id) => {
    const raw = window.localStorage.getItem(BLOB_PREFIX + id);
    if (raw === null) return null;
    try {
      return dataUrlToBlob(raw);
    } catch {
      return null;
    }
  },
  keys: async () => {
    const ids: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(BLOB_PREFIX)) ids.push(key.slice(BLOB_PREFIX.length));
    }
    return ids;
  },
  delete: async (ids) => {
    ids.forEach((id) => window.localStorage.removeItem(BLOB_PREFIX + id));
  },
};