import { applyUkrainianGrammar, markQuestions } from './ukrainianGrammar';

export interface TimedSegment {
  text: string;
  firstAt: number;
  lastAt: number;
}

const COMMA_PAUSE_MS = 600;
const SENTENCE_PAUSE_MS = 1400;
const SENTENCE_END = /[.!?…]\s*$/;
const ANY_MARK = /[.,!?…:;]$/;

const capitalize = (text: string): string =>
  text.charAt(0).toLocaleUpperCase('uk-UA') + text.slice(1);

const mergeSegments = (segments: readonly TimedSegment[]): TimedSegment[] => {
  const merged: TimedSegment[] = [];

  for (const raw of segments) {
    const text = raw.text.trim();
    if (text === '') continue;

    const previous = merged[merged.length - 1];
    if (previous === undefined) {
      merged.push({ ...raw, text });
      continue;
    }

    const next = text.toLowerCase();
    const last = previous.text.toLowerCase();
    const lastAt = Math.max(previous.lastAt, raw.lastAt);

    if (next.startsWith(last)) merged[merged.length - 1] = { text, firstAt: previous.firstAt, lastAt };
    else if (last.startsWith(next)) merged[merged.length - 1] = { ...previous, lastAt };
    else merged.push({ ...raw, text });

  }

  return merged;
};

export const punctuateTranscript = (
  segments: readonly TimedSegment[],
  isFinal: boolean,
): string => {
  const merged = mergeSegments(segments);
  let result = '';

  merged.forEach((segment, index) => {
    if (index > 0) {
      const gap = segment.firstAt - merged[index - 1].lastAt;
      if (ANY_MARK.test(result)) result += ' ';
      else if (gap >= SENTENCE_PAUSE_MS) result += '. ';
      else if (gap >= COMMA_PAUSE_MS) result += ', ';
      else result += ' ';
    }
    const startsSentence = result === '' || SENTENCE_END.test(result);
    result += startsSentence ? capitalize(segment.text) : segment.text;
  });

  result = applyUkrainianGrammar(result);

  if (isFinal && result !== '' && !SENTENCE_END.test(result)) {
    result = `${result.replace(/[,;:]$/, '')}.`;
  }

  return markQuestions(result);
};