import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { normalizeNoteRoot, readNoteMarkdown, writeNoteDocument } from '../lib/noteDocument';
import { placeCaret } from '../lib/noteSelection';
import type { NoteSelection } from '../lib/noteSelection';
import { applyNoteSnapshot, captureNoteSnapshot } from '../lib/noteSnapshot';
import type { NoteSnapshot } from '../lib/noteSnapshot';
import { useNoteHistory } from './useNoteHistory';

interface NoteDocumentOptions {
  rootRef: RefObject<HTMLDivElement | null>;
  value: string;
  onChange: (value: string) => void;
  rememberSelection: (selection: NoteSelection | null) => void;
  reconcile: (root: HTMLElement) => void;
}

export function useNoteDocument({
  rootRef,
  value,
  onChange,
  rememberSelection,
  reconcile,
}: NoteDocumentOptions) {
  const onChangeRef = useRef(onChange);
  const emittedRef = useRef<string | null>(null);
  const currentRef = useRef<NoteSnapshot | null>(null);
  const [isEmpty, setIsEmpty] = useState(value === '');
  const { canUndo, canRedo, reset, breakTyping, record, goBack, goForward } = useNoteHistory();

  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  const emit = useCallback((root: HTMLElement) => {
    const markdown = readNoteMarkdown(root);
    setIsEmpty(markdown === '');
    if (markdown === emittedRef.current) return;
    emittedRef.current = markdown;
    onChangeRef.current(markdown);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || emittedRef.current === value) return;
    if (currentRef.current && document.activeElement === root) return;

    writeNoteDocument(root, value);
    reconcile(root);
    emittedRef.current = value;
    currentRef.current = captureNoteSnapshot(root);
    setIsEmpty(value === '');
    reset();
  }, [rootRef, value, reset, reconcile]);

  const commit = useCallback(
    (isBoundary: boolean, isComposing = false) => {
      const root = rootRef.current;
      if (!root) return;

      if (!isComposing) {
        const adopted = normalizeNoteRoot(root);
        if (adopted) placeCaret(root, adopted, 'end');
        reconcile(root);
      }

      const snapshot = captureNoteSnapshot(root);
      const previous = currentRef.current;
      rememberSelection(snapshot.selection);

      if (previous && previous.html !== snapshot.html) record(previous, isBoundary);

      currentRef.current = snapshot;
      emit(root);
    },
    [rootRef, rememberSelection, record, emit, reconcile],
  );

  const travel = useCallback(
    (snapshot: NoteSnapshot | null) => {
      const root = rootRef.current;
      if (!root || !snapshot) return;
      applyNoteSnapshot(root, snapshot);
      reconcile(root);
      currentRef.current = captureNoteSnapshot(root);
      emit(root);
    },
    [rootRef, reconcile, emit],
  );

  const undo = useCallback(() => {
    const root = rootRef.current;
    if (root) travel(goBack(captureNoteSnapshot(root)));
  }, [rootRef, goBack, travel]);

  const redo = useCallback(() => {
    const root = rootRef.current;
    if (root) travel(goForward(captureNoteSnapshot(root)));
  }, [rootRef, goForward, travel]);

  return { isEmpty, commit, undo, redo, canUndo, canRedo, breakTyping };
}