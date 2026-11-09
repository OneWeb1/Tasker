import { useCallback, useRef, useState } from 'react';
import { HISTORY_LIMIT, TYPING_HISTORY_GAP_MS } from '../constants/noteEditor';
import { EMPTY_NOTE_HISTORY, recordChange, stepBack, stepForward } from '../lib/noteHistory';
import type { HistoryStep } from '../lib/noteHistory';
import type { NoteSnapshot } from '../lib/noteSnapshot';

const NO_HISTORY = { canUndo: false, canRedo: false };

export function useNoteHistory() {
  const historyRef = useRef(EMPTY_NOTE_HISTORY);
  const lastTypedAt = useRef(0);
  const [availability, setAvailability] = useState(NO_HISTORY);

  const publish = useCallback(() => {
    const { past, future } = historyRef.current;
    const next = { canUndo: past.length > 0, canRedo: future.length > 0 };
    setAvailability((current) =>
      current.canUndo === next.canUndo && current.canRedo === next.canRedo ? current : next,
    );
  }, []);

  const reset = useCallback(() => {
    historyRef.current = EMPTY_NOTE_HISTORY;
    lastTypedAt.current = 0;
    publish();
  }, [publish]);

  const breakTyping = useCallback(() => {
    lastTypedAt.current = 0;
  }, []);

  const record = useCallback(
    (previous: NoteSnapshot, isBoundary: boolean) => {
      const now = Date.now();
      const startsStep = isBoundary || now - lastTypedAt.current > TYPING_HISTORY_GAP_MS;
      historyRef.current = recordChange(historyRef.current, previous, startsStep, HISTORY_LIMIT);
      lastTypedAt.current = isBoundary ? 0 : now;
      publish();
    },
    [publish],
  );

  const travel = useCallback(
    (step: HistoryStep | null): NoteSnapshot | null => {
      if (!step) return null;
      historyRef.current = step.history;
      lastTypedAt.current = 0;
      publish();
      return step.target;
    },
    [publish],
  );

  const goBack = useCallback(
    (current: NoteSnapshot) => travel(stepBack(historyRef.current, current)),
    [travel],
  );

  const goForward = useCallback(
    (current: NoteSnapshot) => travel(stepForward(historyRef.current, current, HISTORY_LIMIT)),
    [travel],
  );

  return {
    canUndo: availability.canUndo,
    canRedo: availability.canRedo,
    reset,
    breakTyping,
    record,
    goBack,
    goForward,
  };
}