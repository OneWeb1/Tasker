const LINK_PATTERN = /\[([^\]\n]+)\]\(([^)\s]+)\)/y;
const ALLOWED_PROTOCOLS: readonly string[] = ['http:', 'https:', 'mailto:', 'tel:'];
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

export interface MarkdownLinkMatch {
  label: string;
  href: string;
  length: number;
}

export const sanitizeHref = (raw: string): string | null => {
  const value = raw.trim();
  if (value === '') return null;
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(value).protocol) ? value : null;
  } catch {
    return null;
  }
};

export const normalizeHref = (raw: string): string => {
  const value = raw.trim();
  return value === '' || SCHEME_PATTERN.test(value) ? value : `https://${value}`;
};

export const matchMarkdownLink = (text: string, index: number): MarkdownLinkMatch | null => {
  LINK_PATTERN.lastIndex = index;
  const match = LINK_PATTERN.exec(text);
  if (!match) return null;
  const href = sanitizeHref(match[2]);
  return href ? { label: match[1], href, length: match[0].length } : null;
};