export const mergeTranscript = (segments: readonly string[]): string => {
  const merged: string[] = [];

  for (const raw of segments) {
    const segment = raw.trim();
    if (segment === '') continue;

    const previous = merged[merged.length - 1];
    if (previous === undefined) {
      merged.push(segment);
      continue;
    }

    const next = segment.toLowerCase();
    const last = previous.toLowerCase();

    if (next.startsWith(last)) merged[merged.length - 1] = segment;
    else if (!last.startsWith(next)) merged.push(segment);

  }

  return merged.join(' ');
};