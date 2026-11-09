import type { NewNote, Note } from '../../model/types/note';

export const buildNoteCopy = (note: Note, overrides: Partial<NewNote> = {}): NewNote => ({
  title: note.title,
  content: note.content,
  updatedAt: Date.now(),
  isArchived: note.isArchived,
  workspaceId: note.workspaceId,
  projectId: note.projectId,
  tags: note.tags ? [...note.tags] : undefined,
  attachments: note.attachments ? note.attachments.map((item) => ({ ...item })) : undefined,
  textAlign: note.textAlign,
  color: note.color,
  ...overrides,
});