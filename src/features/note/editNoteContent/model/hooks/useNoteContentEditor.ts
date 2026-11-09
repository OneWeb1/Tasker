import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { NOTE_TABLE_COLUMNS, NOTE_TABLE_ROWS } from '../constants/noteEditor';
import { applyNoteFormat } from '../lib/applyNoteFormat';
import { insertAttachmentsBlock, syncAttachmentBlocks } from '../lib/noteAttachmentBlocks';
import {
  alignSelectedBlocks,
  fillBlockAlign,
  insertDividerBlock,
  insertTextBlocks,
  toggleBlockKind,
} from '../lib/noteBlocks';
import { getNoteBlocks, isAttachmentsBlock, normalizeNoteRoot } from '../lib/noteDocument';
import { applyLink } from '../lib/noteInline';
import { insertTableBlocks } from '../lib/noteTable';
import { focusNoteTail } from '../lib/noteTail';
import type { NoteFormatAction, NoteTextAlign } from '../types/noteFormat';
import { useNoteDocument } from './useNoteDocument';
import { useNoteEditorEvents } from './useNoteEditorEvents';
import { useNoteSelectionMemory } from './useNoteSelectionMemory';

export function useNoteContentEditor(
  value: string,
  onChange: (value: string) => void,
  groupIds: readonly string[],
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const groupIdsRef = useRef(groupIds);
  const { remember, recall, focus, focusEnd, blur } = useNoteSelectionMemory(rootRef);

  useLayoutEffect(() => {
    groupIdsRef.current = groupIds;
  });

  const reconcile = useCallback((root: HTMLElement) => {
    if (syncAttachmentBlocks(root, groupIdsRef.current)) normalizeNoteRoot(root);
  }, []);

  const { isEmpty, commit, undo, redo, canUndo, canRedo, breakTyping } = useNoteDocument({
    rootRef,
    value,
    onChange,
    rememberSelection: remember,
    reconcile,
  });

  const groupKey = groupIds.join('|');

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !syncAttachmentBlocks(root, groupIdsRef.current)) return;
    normalizeNoteRoot(root);
    commit(true);
  }, [groupKey, commit]);

  useNoteEditorEvents({ rootRef, commit, undo, redo });

  const format = useCallback(
    (action: NoteFormatAction) => {
      const root = focus();
      if (!root) return;
      breakTyping();
      applyNoteFormat(root, action);
      commit(true);
    },
    [breakTyping, commit, focus],
  );

  const insertText = useCallback(
    (text: string) => {
      const root = focus();
      if (!root) return;
      insertTextBlocks(root, text);
      commit(true);
    },
    [commit, focus],
  );

  const link = useCallback(
    (url: string) => {
      const root = focus();
      if (!root) return;
      breakTyping();
      applyLink(root, url);
      commit(true);
    },
    [breakTyping, commit, focus],
  );

  const insertDivider = useCallback(() => {
    const root = focus();
    if (!root) return;
    breakTyping();
    insertDividerBlock(root);
    commit(true);
  }, [breakTyping, commit, focus]);

  const insertTable = useCallback(() => {
    const root = focus();
    if (!root) return;
    breakTyping();
    insertTableBlocks(root, NOTE_TABLE_ROWS, NOTE_TABLE_COLUMNS);
    commit(true);
  }, [breakTyping, commit, focus]);

  const insertToggle = useCallback(() => {
    const root = focus();
    if (!root) return;
    breakTyping();
    toggleBlockKind(root, 'toggle');
    commit(true);
  }, [breakTyping, commit, focus]);

  const focusTail = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.focus({ preventScroll: true });
    focusNoteTail(root);
    commit(true);
  }, [commit]);

  const align = useCallback(
    (next: NoteTextAlign) => {
      const root = focus();
      if (!root) return;
      breakTyping();
      alignSelectedBlocks(root, next);
      commit(true);
    },
    [breakTyping, commit, focus],
  );

  const adoptAlign = useCallback(
    (next: NoteTextAlign) => {
      const root = rootRef.current;
      if (!root) return;
      fillBlockAlign(root, next);
      commit(false);
    },
    [commit],
  );

  const insertAttachmentGroup = useCallback(
    (groupId: string) => {
      const root = rootRef.current;
      if (!root) return;
      groupIdsRef.current = groupIdsRef.current.concat(groupId);
      insertAttachmentsBlock(root, groupId, recall()?.end.block ?? null);
      commit(true);
    },
    [commit, recall],
  );

  const removeAttachmentSlot = useCallback(
    (groupId: string) => {
      const root = rootRef.current;
      if (!root) return;
      const block = getNoteBlocks(root).find(
        (item) => isAttachmentsBlock(item) && item.dataset.group === groupId,
      );
      if (!block) return;
      block.remove();
      normalizeNoteRoot(root);
      commit(true);
    },
    [commit],
  );

  return {
    rootRef,
    isEmpty,
    format,
    align,
    adoptAlign,
    insertText,
    insertDivider,
    insertTable,
    insertToggle,
    link,
    insertAttachmentGroup,
    removeAttachmentSlot,
    undo,
    redo,
    focus,
    focusEnd,
    focusTail,
    blur,
    canUndo,
    canRedo,
  };
}