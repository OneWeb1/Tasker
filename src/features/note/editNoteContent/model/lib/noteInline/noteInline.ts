import { normalizeHref, sanitizeHref } from '@/shared/lib/utils/markdown';
import type { NoteInlineAction } from '../../types/noteFormat';
import { createCaretAnchor, stripCaretAnchor } from '../noteAnchor';
import { splitNoteBlock } from '../noteBlocks';
import { getBlockKind } from '../noteDocument';
import { captureNoteSelection, getSelectedBlocks, restoreNoteSelection } from '../noteSelection';

type InlineTag = 'code' | 'mark';

const COMMANDS: Record<Exclude<NoteInlineAction, 'code' | 'highlight'>, string> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strike: 'strikeThrough',
};

const findInline = (node: Node, root: HTMLElement, tag: InlineTag): HTMLElement | null => {
  for (let current: Node | null = node; current && current !== root; current = current.parentNode) {
    if (current instanceof HTMLElement && current.tagName === tag.toUpperCase()) return current;
  }
  return null;
};

const placeCaretIn = (selection: Selection, node: Node, offset: number): void => {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const isCaretAtEnd = (range: Range, code: HTMLElement): boolean => {
  const tail = document.createRange();
  tail.selectNodeContents(code);
  tail.setStart(range.endContainer, range.endOffset);
  return tail.toString() === '';
};

const leaveCode = (selection: Selection, code: HTMLElement): void => {
  const anchor = createCaretAnchor();
  code.after(anchor);
  placeCaretIn(selection, anchor, anchor.length);
};

const enterInline = (selection: Selection, range: Range, tag: InlineTag): void => {
  const anchor = createCaretAnchor();
  const code = document.createElement(tag);
  code.append(anchor);
  range.insertNode(code);
  placeCaretIn(selection, anchor, anchor.length);
};

const toggleInlineElement = (root: HTMLElement, tag: InlineTag): void => {
  const selection = window.getSelection();
  const saved = captureNoteSelection(root);
  if (!selection || selection.rangeCount === 0 || !saved) return;

  const range = selection.getRangeAt(0);
  const existing = findInline(range.commonAncestorContainer, root, tag);

  if (existing) {
    const hasText = stripCaretAnchor(existing.textContent ?? '') !== '';
    if (range.collapsed && hasText && isCaretAtEnd(range, existing)) {
      leaveCode(selection, existing);
      return;
    }
    existing.replaceWith(...Array.from(existing.childNodes));
    restoreNoteSelection(root, saved);
    return;
  }

  if (range.collapsed) {
    enterInline(selection, range, tag);
    return;
  }

  if (saved.start.block !== saved.end.block) return;

  const code = document.createElement(tag);
  code.append(range.extractContents());
  range.insertNode(code);
  restoreNoteSelection(root, saved);
};

export const applyInlineMark = (root: HTMLElement, action: NoteInlineAction): void => {
  const blocks = getSelectedBlocks(root);
  if (blocks.length === 0 || blocks.some((block) => getBlockKind(block) === 'code')) return;

  if (action === 'code' || action === 'highlight') {
    toggleInlineElement(root, action === 'code' ? 'code' : 'mark');
    return;
  }

  document.execCommand('styleWithCSS', false, 'false');
  document.execCommand(COMMANDS[action]);
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const applyLink = (root: HTMLElement, rawUrl: string): void => {
  const blocks = getSelectedBlocks(root);
  if (blocks.length === 0 || blocks.some((block) => getBlockKind(block) === 'code')) return;

  if (rawUrl.trim() === '') {
    document.execCommand('unlink');
    return;
  }

  const href = sanitizeHref(normalizeHref(rawUrl));
  if (!href) return;

  const selection = window.getSelection();
  if (selection && selection.isCollapsed) {
    const safe = escapeHtml(href);
    document.execCommand('insertHTML', false, `<a href="${safe}">${safe}</a>&nbsp;`);
    return;
  }
  document.execCommand('createLink', false, href);
};

export const insertPlainText = (root: HTMLElement, text: string): void => {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) document.execCommand('delete');

  text
    .replace(/\r/g, '')
    .split('\n')
    .forEach((line, index) => {
      if (index > 0) splitNoteBlock(root);
      if (line !== '') document.execCommand('insertText', false, line);
    });
};