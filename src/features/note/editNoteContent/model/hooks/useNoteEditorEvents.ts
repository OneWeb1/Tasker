import { useEffect } from 'react';
import type { RefObject } from 'react';
import { ATTACHMENT_SLOT_SELECTOR, toggleBlockCollapsed } from '@/shared/lib/utils/markdown';
import { CHECKBOX_HIT_SLOP_PX } from '../constants/noteEditor';
import {
  demoteBlockAtCaret,
  guardAttachmentBoundary,
  isCheckboxHit,
  splitNoteBlock,
  toggleCheckBlock,
} from '../lib/noteBlocks';
import { insertPlainText } from '../lib/noteInline';
import { guardTableCell, moveTableCell } from '../lib/noteTable';
import { focusNoteTail, isBelowNoteBlocks } from '../lib/noteTail';

const isSlotEvent = (event: Event): boolean =>
  event.target instanceof Element && event.target.closest(ATTACHMENT_SLOT_SELECTOR) !== null;

interface NoteEditorEventsOptions {
  rootRef: RefObject<HTMLDivElement | null>;
  commit: (isBoundary: boolean, isComposing?: boolean) => void;
  undo: () => void;
  redo: () => void;
}

export function useNoteEditorEvents({ rootRef, commit, undo, redo }: NoteEditorEventsOptions) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const breakLine = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) document.execCommand('delete');
      splitNoteBlock(root);
      commit(true);
    };

    const handleBeforeInput = (event: InputEvent) => {
      if (isSlotEvent(event)) return;
      switch (event.inputType) {
        case 'insertParagraph':
        case 'insertLineBreak':
          event.preventDefault();
          breakLine();
          break;
        case 'historyUndo':
          event.preventDefault();
          undo();
          break;
        case 'historyRedo':
          event.preventDefault();
          redo();
          break;
        case 'insertFromDrop':
          event.preventDefault();
          break;
        case 'deleteContentBackward':
          if (
            guardTableCell(root, 'backward') ||
            demoteBlockAtCaret(root) ||
            guardAttachmentBoundary(root, 'backward')
          ) {
            event.preventDefault();
            commit(true);
          }
          break;
        case 'deleteContentForward':
          if (guardTableCell(root, 'forward') || guardAttachmentBoundary(root, 'forward')) {
            event.preventDefault();
            commit(true);
          }
          break;
        default:
          break;
      }
    };

    const handleInput = (event: Event) => {
      if (isSlotEvent(event)) return;
      commit(false, event instanceof InputEvent && event.isComposing);
    };

    const handleCompositionEnd = (event: Event) => {
      if (isSlotEvent(event)) return;
      commit(false);
    };

    const handlePaste = (event: ClipboardEvent) => {
      if (isSlotEvent(event)) return;
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain') ?? '';
      if (text === '') return;
      insertPlainText(root, text);
      commit(true);
    };

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (event.target === root) {
        if (!isBelowNoteBlocks(root, event.clientY)) return;
        focusNoteTail(root);
        commit(true);
        return;
      }
      const block = event.target.closest<HTMLElement>('[data-b="check"], [data-b="toggle"]');
      if (!block || block.parentElement !== root) return;
      if (!isCheckboxHit(block, event.clientX, CHECKBOX_HIT_SLOP_PX)) return;

      if (block.dataset.b === 'toggle') toggleBlockCollapsed(block);
      else toggleCheckBlock(block);
      commit(true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.isComposing || isSlotEvent(event)) return;
      if (!moveTableCell(root, event.shiftKey ? -1 : 1)) return;
      event.preventDefault();
      commit(true);
    };

    root.addEventListener('keydown', handleKeyDown);
    root.addEventListener('beforeinput', handleBeforeInput);
    root.addEventListener('input', handleInput);
    root.addEventListener('compositionend', handleCompositionEnd);
    root.addEventListener('paste', handlePaste);
    root.addEventListener('click', handleClick);

    return () => {
      root.removeEventListener('beforeinput', handleBeforeInput);
      root.removeEventListener('input', handleInput);
      root.removeEventListener('compositionend', handleCompositionEnd);
      root.removeEventListener('paste', handlePaste);
      root.removeEventListener('click', handleClick);
      root.removeEventListener('keydown', handleKeyDown);
    };
  }, [rootRef, commit, undo, redo]);
}