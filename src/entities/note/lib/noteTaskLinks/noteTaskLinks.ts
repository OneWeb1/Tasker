import type { Note } from '../../model/types/note';

type LinkableNote = Pick<Note, 'taskIds'>;

export const isNoteLinkedToTask = (note: LinkableNote, taskId: string): boolean =>
  note.taskIds?.includes(taskId) ?? false;

export const linkNoteToTask = (note: LinkableNote, taskId: string): string[] => {
  const current = note.taskIds ?? [];
  return current.includes(taskId) ? [...current] : [...current, taskId];
};

export const unlinkNoteFromTask = (note: LinkableNote, taskId: string): string[] =>
  (note.taskIds ?? []).filter((id) => id !== taskId);