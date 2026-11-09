import type { NoteFormatAction, NoteInlineAction } from '../../types/noteFormat';
import { shiftIndent, toggleLinePrefix } from './lineFormat';
import { toggleInline, wrapCodeBlock } from './selectionFormat';
import type { TextEdit } from './textEdit';

const INLINE_MARKERS: Record<NoteInlineAction, readonly [string, string]> = {
  bold: ['**', '**'],
  italic: ['_', '_'],
  underline: ['<u>', '</u>'],
  strike: ['~~', '~~'],
  highlight: ['==', '=='],
  code: ['`', '`'],
};

export const applyNoteFormat = (edit: TextEdit, action: NoteFormatAction): TextEdit => {
  switch (action) {
    case 'bold':
    case 'italic':
    case 'underline':
    case 'strike':
    case 'highlight':
    case 'code':
      return toggleInline(edit, ...INLINE_MARKERS[action]);
    case 'codeBlock':
      return wrapCodeBlock(edit);
    case 'indent':
      return shiftIndent(edit, 1);
    case 'outdent':
      return shiftIndent(edit, -1);
    default:
      return toggleLinePrefix(edit, action);
  }
};