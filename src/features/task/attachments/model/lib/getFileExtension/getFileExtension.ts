const FALLBACK_EXTENSION = 'ФАЙЛ';
const MAX_EXTENSION_LENGTH = 4;

export const getFileExtension = (name: string): string => {
  const index = name.lastIndexOf('.');
  return index > 0
    ? name.slice(index + 1, index + 1 + MAX_EXTENSION_LENGTH).toUpperCase()
    : FALLBACK_EXTENSION;
};