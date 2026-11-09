import type { TaskAttachment } from '@/entities/task';
import { saveFile } from '@/shared/lib/utils/file';
import { getBlob } from '@/shared/lib/utils/storage';

const FALLBACK_MIME = 'application/octet-stream';

export const downloadAttachment = async (
  attachment: Pick<TaskAttachment, 'name' | 'blobId'>,
): Promise<void> => {
  const blob = await getBlob(attachment.blobId);
  if (blob === null) return;
  await saveFile(attachment.name, blob, blob.type || FALLBACK_MIME);
};