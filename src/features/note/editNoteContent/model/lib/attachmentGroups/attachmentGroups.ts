import { moveItem } from '@/shared/lib/utils/moveItem';
import type { NoteAttachment } from '../../types/noteAttachment';

const isMediaType = (type: string): boolean => type.startsWith('image/') || type.startsWith('video/');

export const isMediaBatch = (items: readonly NoteAttachment[]): boolean =>
  items.length > 0 && items.every(({ type }) => isMediaType(type));

export const buildGroupTitle = (existing: readonly NoteAttachment[], isMedia: boolean): string => {
  const groupIds = new Set<string>();
  for (const item of existing) {
    if (item.groupId !== undefined && isMediaType(item.type) === isMedia) groupIds.add(item.groupId);
  }
  return `${isMedia ? 'Медіа' : 'Файли'} ${groupIds.size + 1}`;
};

export const withAttachmentGroup = (
  items: readonly NoteAttachment[],
  groupId: string,
  groupTitle: string,
): NoteAttachment[] => items.map((item) => ({ ...item, groupId, groupTitle }));

export const renameAttachmentGroup = (
  items: readonly NoteAttachment[],
  groupId: string,
  title: string,
): NoteAttachment[] =>
  items.map((item) => (item.groupId === groupId ? { ...item, groupTitle: title } : item));

export const setAttachmentCaption = (
  items: readonly NoteAttachment[],
  id: string,
  caption: string,
): NoteAttachment[] =>
  items.map((item) => {
    if (item.id !== id) return item;
    const { caption: _previous, ...rest } = item;
    return caption === '' ? rest : { ...rest, caption };
  });

export const moveAttachmentInGroup = (
  items: readonly NoteAttachment[],
  id: string,
  direction: -1 | 1,
): NoteAttachment[] => {
  const target = items.find((item) => item.id === id);
  if (!target) return [...items];

  const peers = items.filter((item) => item.groupId === target.groupId);
  const neighbor = peers[peers.indexOf(target) + direction];
  if (!neighbor) return [...items];

  return moveItem(items, items.indexOf(target), items.indexOf(neighbor));
};