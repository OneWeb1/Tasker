export interface StorageChanges {
  puts: ReadonlyArray<readonly [string, string]>;
  deletes: readonly string[];
}

export interface StorageDriver {
  loadAll: () => Promise<Map<string, string>>;
  apply: (changes: StorageChanges) => Promise<void>;
}

export interface BlobDriver {
  put: (id: string, blob: Blob) => Promise<void>;
  get: (id: string) => Promise<Blob | null>;
  keys: () => Promise<string[]>;
  delete: (ids: readonly string[]) => Promise<void>;
}