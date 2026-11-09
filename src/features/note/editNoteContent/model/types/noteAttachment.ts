import type { Note } from '@/entities/note';

export type NoteAttachment = NonNullable<Note['attachments']>[number];