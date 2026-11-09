import type { MarkdownBlockKind } from '@/shared/lib/utils/markdown';
import type { NoteBlockAction, NoteFormatAction, NoteLineAction } from '../../types/noteFormat';
import { shiftBlockLevel, toggleBlockKind } from '../noteBlocks';
import { applyInlineMark } from '../noteInline';

const BLOCK_KIND_BY_ACTION: Record<NoteLineAction | NoteBlockAction, MarkdownBlockKind> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  bullet: 'bullet',
  number: 'number',
  check: 'check',
  quote: 'quote',
  callout: 'callout',
  codeBlock: 'code',
};

export const applyNoteFormat = (root: HTMLElement, action: NoteFormatAction): void => {
  switch (action) {
    case 'bold':
    case 'italic':
    case 'underline':
    case 'strike':
    case 'highlight':
    case 'code':
      applyInlineMark(root, action);
      return;
    case 'indent':
      shiftBlockLevel(root, 1);
      return;
    case 'outdent':
      shiftBlockLevel(root, -1);
      return;
    default:
      toggleBlockKind(root, BLOCK_KIND_BY_ACTION[action]);
  }
};