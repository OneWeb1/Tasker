import { useCallback, useState } from 'react';
import { useTaskPatch } from '@/entities/task';
import type { Task, TaskAttachment } from '@/entities/task';
import { createId } from '@/shared/lib/utils/createId';
import { storeBlob } from '@/shared/lib/utils/storage';
import { MAX_ATTACHMENT_SIZE, MAX_ATTACHMENT_SIZE_LABEL } from '../constants/attachments';

export function useAttachments(task: Task) {
  const patchTask = useTaskPatch();
  const [error, setError] = useState<string | null>(null);
  const attachments = task.attachments ?? [];

  const save = useCallback(
    (next: TaskAttachment[]) => {
      patchTask(task.id, { attachments: next });
    },
    [task.id, patchTask],
  );

  const addFiles = useCallback(
    async (files: readonly File[]) => {
      const accepted: TaskAttachment[] = [];
      let nextError: string | null = null;

      for (const file of files) {
        if (file.size > MAX_ATTACHMENT_SIZE) {
          nextError = `Файл «${file.name}» завеликий (максимум ${MAX_ATTACHMENT_SIZE_LABEL})`;
          continue;
        }
        try {
          const blobId = await storeBlob(file);
          accepted.push({
            id: createId(),
            name: file.name,
            type: file.type,
            size: file.size,
            blobId,
          });
        } catch {
          nextError = `Не вдалося завантажити файл «${file.name}»`;
        }
      }

      setError(nextError);
      if (accepted.length > 0) save([...attachments, ...accepted]);
    },
    [attachments, save],

  );

  const removeAttachments = useCallback(
    (ids: readonly string[]) => {
      setError(null);
      save(attachments.filter((item) => !ids.includes(item.id)));
    },
    [attachments, save],
  );

  return { attachments, error, addFiles, removeAttachments };
}