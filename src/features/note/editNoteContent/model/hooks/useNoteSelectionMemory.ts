import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { captureNoteSelection, placeCaret, restoreNoteSelection } from '../lib/noteSelection';
import type { NoteSelection } from '../lib/noteSelection';

export function useNoteSelectionMemory(rootRef: RefObject<HTMLDivElement | null>) {
  const savedRef = useRef<NoteSelection | null>(null);

  const remember = useCallback((selection: NoteSelection | null) => {
    if (selection) savedRef.current = selection;
  }, []);

  const recall = useCallback((): NoteSelection | null => {
    const root = rootRef.current;
    return (root ? captureNoteSelection(root) : null) ?? savedRef.current;
  }, [rootRef]);

  useEffect(() => {
    let frame = 0;

    const handleSelectionChange = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const root = rootRef.current;
        if (root) remember(captureNoteSelection(root));
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.cancelAnimationFrame(frame);
    };
  }, [rootRef, remember]);

  const focus = useCallback((): HTMLDivElement | null => {
    const root = rootRef.current;
    if (!root) return null;

    const selection = captureNoteSelection(root) ?? savedRef.current;
    root.focus({ preventScroll: true });
    if (selection) restoreNoteSelection(root, selection);
    else placeCaret(root, null, 'end');
    return root;
  }, [rootRef]);

  const focusEnd = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.focus({ preventScroll: true });
    placeCaret(root, null, 'end');
  }, [rootRef]);

  const blur = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    remember(captureNoteSelection(root));
    root.blur();
  }, [rootRef, remember]);

  return { remember, recall, focus, focusEnd, blur };
}