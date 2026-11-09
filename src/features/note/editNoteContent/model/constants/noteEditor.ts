import type { MarkdownSlotKind } from '@/shared/lib/utils/markdown';
import type { NoteInsertAction, NoteMediaSource, NoteTextAlign } from '../types/noteFormat';

export const CONTENT_FOCUS_DELAY_MS = 380;

export const HISTORY_LIMIT = 100;

export const TYPING_HISTORY_GAP_MS = 800;

export const CHECKBOX_HIT_SLOP_PX = 8;

export const MAX_NOTE_ATTACHMENT_SIZE = 5 * 1024 * 1024;

export const MAX_NOTE_ATTACHMENT_SIZE_LABEL = '5 МБ';

export const NOTE_TABLE_ROWS = 3;

export const NOTE_TABLE_COLUMNS = 3;

export const DEFAULT_NOTE_ALIGN: NoteTextAlign = 'left';

export const NOTE_MEDIA_ACCEPT: Record<NoteMediaSource, string> = {
  gallery: 'image/*,video/*',
  camera: 'image/*',
  file: '*/*',
};

export const NOTE_SLOT_SOURCE: Record<MarkdownSlotKind, NoteMediaSource> = {
  media: 'gallery',
  file: 'file',
};

export const NOTE_MEDIA_ITEMS: readonly { source: NoteMediaSource; label: string }[] = [
  { source: 'gallery', label: 'Галерея' },
  { source: 'camera', label: 'Камера' },
  { source: 'file', label: 'Файл' },
];

export const NOTE_ALIGN_ITEMS: readonly { value: NoteTextAlign; label: string }[] = [
  { value: 'left', label: 'По лівому краю' },
  { value: 'center', label: 'По центру' },
  { value: 'right', label: 'По правому краю' },
];

interface InsertSection {
  title: string;
  items: readonly { action: NoteInsertAction; label: string }[];
}

export const NOTE_INSERT_SECTIONS: readonly InsertSection[] = [
  {
    title: 'Текст',
    items: [
      { action: 'h1', label: 'Заголовок 1' },
      { action: 'h2', label: 'Заголовок 2' },
      { action: 'h3', label: 'Заголовок 3' },
      { action: 'h4', label: 'Заголовок 4' },
    ],
  },
  {
    title: 'Списки',
    items: [
      { action: 'bullet', label: 'Маркери' },
      { action: 'number', label: 'Нумерація' },
      { action: 'check', label: 'Чекліст' },
    ],
  },
  {
    title: 'Блоки',
    items: [
      { action: 'codeBlock', label: 'Блок коду' },
      { action: 'quote', label: 'Цитата' },
      { action: 'callout', label: 'Виноска' },
      { action: 'divider', label: 'Роздільник' },
      { action: 'table', label: 'Таблиця' },
      { action: 'toggle', label: 'Згортувана секція' },
    ],
  },
];