export type FileKind =
  | 'pdf'
  | 'document'
  | 'sheet'
  | 'presentation'
  | 'archive'
  | 'audio'
  | 'video'
  | 'image'
  | 'code'
  | 'text'
  | 'other';

const MAX_LABEL_LENGTH = 4;
const FALLBACK_LABEL = 'ФАЙЛ';

const KIND_EXTENSIONS: Record<Exclude<FileKind, 'other'>, readonly string[]> = {
  pdf: ['pdf'],
  document: ['doc', 'docx', 'odt', 'rtf', 'pages'],
  sheet: ['xls', 'xlsx', 'ods', 'csv', 'numbers'],
  presentation: ['ppt', 'pptx', 'odp', 'key'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', '3gp'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'avif'],
  code: ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'xml', 'yml', 'yaml', 'py', 'java', 'sh', 'sql'],
  text: ['txt', 'md', 'log'],
};

const EXTENSION_KINDS = new Map<string, FileKind>(
  Object.entries(KIND_EXTENSIONS).flatMap(([kind, extensions]) =>
    extensions.map((extension) => [extension, kind as FileKind] as const),
  ),
);

export const getFileExtension = (name: string): string => {
  const index = name.lastIndexOf('.');
  return index > 0 ? name.slice(index + 1).trim().toLowerCase() : '';
};

export const getFileKind = (name: string, mimeType = ''): FileKind => {
  const byExtension = EXTENSION_KINDS.get(getFileExtension(name));
  if (byExtension) return byExtension;
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';
  return 'other';
};

export const getFileLabel = (name: string): string => {
  const extension = getFileExtension(name);
  return extension === '' ? FALLBACK_LABEL : extension.slice(0, MAX_LABEL_LENGTH).toUpperCase();
};

export type FilePreviewMode = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'none';

const TEXT_MIME_TYPES: ReadonlySet<string> = new Set([
  'application/json',
  'application/xml',
  'application/javascript',
]);

export const getFilePreviewMode = (name: string, mimeType = ''): FilePreviewMode => {
  const kind = getFileKind(name, mimeType);
  if (kind === 'image' || kind === 'video' || kind === 'audio' || kind === 'pdf') return kind;
  if (
    kind === 'code' ||
    kind === 'text' ||
    getFileExtension(name) === 'csv' ||
    TEXT_MIME_TYPES.has(mimeType)
  ) {
    return 'text';
  }
  return 'none';
};