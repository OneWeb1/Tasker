import type { NoteAttachment } from '../../model/types/note';

export interface NoteAttachmentGroup {
  id: string | null;
  title: string;
  items: NoteAttachment[];
}

const UNGROUPED_KEY = '__ungrouped__';

export const groupNoteAttachments = (
  attachments: readonly NoteAttachment[],
): NoteAttachmentGroup[] => {
  const groups = new Map<string, NoteAttachmentGroup>();

  for (const item of attachments) {
    const key = item.groupId ?? UNGROUPED_KEY;
    const existing = groups.get(key);
    if (existing) existing.items.push(item);
    else {
      groups.set(key, {
        id: item.groupId ?? null,
        title: item.groupTitle ?? '',
        items: [item],
      });
    }
  }

  return [...groups.values()];
};