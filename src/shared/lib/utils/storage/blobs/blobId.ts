const BLOB_ID_PATTERN = /blob-[0-9a-z]+-[0-9a-f]{16}/g;
const RANDOM_BYTES = 8;

export const createBlobId = (): string => {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(RANDOM_BYTES)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `blob-${Date.now().toString(36)}-${random}`;
};

export const getBlobCreatedAt = (id: string): number => {
  const timestamp = Number.parseInt(id.split('-')[1] ?? '', 36);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const collectBlobIds = (values: Iterable<string>): Set<string> => {
  const ids = new Set<string>();
  for (const value of values) {
    for (const match of value.matchAll(BLOB_ID_PATTERN)) ids.add(match[0]);
  }
  return ids;
};