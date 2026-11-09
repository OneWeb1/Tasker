import type { NoteSnapshot } from '../noteSnapshot';

interface NoteHistory {
  past: readonly NoteSnapshot[];
  future: readonly NoteSnapshot[];
}

export interface HistoryStep {
  history: NoteHistory;
  target: NoteSnapshot;
}

export const EMPTY_NOTE_HISTORY: NoteHistory = { past: [], future: [] };

export const recordChange = (
  history: NoteHistory,
  previous: NoteSnapshot,
  startsStep: boolean,
  limit: number,
): NoteHistory => ({
  past: startsStep ? [...history.past, previous].slice(-limit) : history.past,
  future: [],
});

export const stepBack = (history: NoteHistory, current: NoteSnapshot): HistoryStep | null => {
  const target = history.past[history.past.length - 1];
  if (!target) return null;

  return {
    target,
    history: { past: history.past.slice(0, -1), future: [current, ...history.future] },
  };
};

export const stepForward = (
  history: NoteHistory,
  current: NoteSnapshot,
  limit: number,
): HistoryStep | null => {
  const [target, ...future] = history.future;
  if (!target) return null;

  return {
    target,
    history: { past: [...history.past, current].slice(-limit), future },
  };
};