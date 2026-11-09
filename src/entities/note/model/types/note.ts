export type NoteAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  blobId: string;
  caption?: string;
  groupId?: string;
  groupTitle?: string;
};

export type NoteTextAlign = 'left' | 'center' | 'right';

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  isArchived?: boolean;
  isPinned?: boolean;
  workspaceId?: string;
  projectId?: string | null;
  tags?: string[];
  attachments?: NoteAttachment[];
    textAlign?: NoteTextAlign;
  color?: string;
  taskIds?: string[];
};

export type NewNote = Omit<Note, 'id'>;

export type DeletedNote = { record: Note; index: number };

export type NoteFragment = {
  text: string;
  occurrence: number;
};