import type { Note } from '@/entities/note';

export type NoteInlineAction = 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code';

export type NoteLineAction =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bullet'
  | 'number'
  | 'check'
  | 'quote'
  | 'callout';

export type NoteBlockAction = 'codeBlock';

export type NoteIndentAction = 'indent' | 'outdent';

export type NoteFormatAction =
  | NoteInlineAction
  | NoteLineAction
  | NoteBlockAction
  | NoteIndentAction;

export type NoteInsertAction = NoteLineAction | NoteBlockAction | 'divider' | 'table' | 'toggle';

export type NotePanel = 'insert' | 'voice';

export type NoteMediaSource = 'gallery' | 'camera' | 'file';

export type NoteTextAlign = NonNullable<Note['textAlign']>;