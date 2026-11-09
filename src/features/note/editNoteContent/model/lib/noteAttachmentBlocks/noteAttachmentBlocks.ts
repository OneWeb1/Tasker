import { readAttachmentSlot } from '@/shared/lib/utils/markdown';
import { createAttachmentsBlock, getNoteBlocks, isAttachmentsBlock } from '../noteDocument';

export const insertAttachmentsBlock = (
  root: HTMLElement,
  groupId: string,
  afterBlockIndex: number | null,
): void => {
  const blocks = getNoteBlocks(root);
  const anchor = blocks[afterBlockIndex ?? blocks.length - 1];
  const block = createAttachmentsBlock(groupId);

  if (anchor) anchor.after(block);
  else root.append(block);
};

export const syncAttachmentBlocks = (root: HTMLElement, groupIds: readonly string[]): boolean => {
  const wanted = new Set(groupIds);
  const present = new Set<string>();
  let isChanged = false;

  for (const block of getNoteBlocks(root)) {
    if (!isAttachmentsBlock(block)) continue;
    const id = block.dataset.group ?? '';
    const isSlot = readAttachmentSlot(block) !== undefined;
    if ((!wanted.has(id) && !isSlot) || present.has(id)) {
      block.remove();
      isChanged = true;
    } else {
      present.add(id);
    }
  }

  for (const id of wanted) {
    if (present.has(id)) continue;
    root.append(createAttachmentsBlock(id));
    isChanged = true;
  }

  return isChanged;
};