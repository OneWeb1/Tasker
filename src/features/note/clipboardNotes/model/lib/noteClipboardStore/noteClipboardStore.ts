import { createExternalStore } from '@/shared/lib/utils/externalStore';

export type NoteClipboardMode = 'copy' | 'cut';

export interface NoteClipboardState {
  mode: NoteClipboardMode;
  ids: readonly string[];
}

const store = createExternalStore<NoteClipboardState | null>(null);

export const getNoteClipboard = store.get;

export const setNoteClipboard = store.set;

export const subscribeNoteClipboard = store.subscribe;