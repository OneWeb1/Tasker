export interface ParsedDataUrl {
  mime: string;
  bytes: Uint8Array<ArrayBuffer>;
}

const DATA_PREFIX = 'data:';
const BASE64_SUFFIX = ';base64';

const toBytes = (source: ArrayLike<number>): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(source.length);
  bytes.set(source);
  return bytes;
};

export const parseDataUrl = (dataUrl: string): ParsedDataUrl => {
  const comma = dataUrl.indexOf(',');
  if (!dataUrl.startsWith(DATA_PREFIX) || comma === -1) throw new Error('Invalid data URL');

  const header = dataUrl.slice(DATA_PREFIX.length, comma);
  const payload = dataUrl.slice(comma + 1);
  const mime = header.split(';')[0] ?? '';

  if (header.endsWith(BASE64_SUFFIX)) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return { mime, bytes };
  }

  return { mime, bytes: toBytes(new TextEncoder().encode(decodeURIComponent(payload))) };
};

export const dataUrlToBlob = (dataUrl: string, mimeOverride?: string): Blob => {
  const { mime, bytes } = parseDataUrl(dataUrl);
  return new Blob([bytes], { type: mimeOverride || mime });
};

