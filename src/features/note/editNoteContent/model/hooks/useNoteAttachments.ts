import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { createId } from '@/shared/lib/utils/createId';
import type { MarkdownSlotKind } from '@/shared/lib/utils/markdown';
import { storeBlob } from '@/shared/lib/utils/storage';
import {
  MAX_NOTE_ATTACHMENT_SIZE,
  MAX_NOTE_ATTACHMENT_SIZE_LABEL,
  NOTE_MEDIA_ACCEPT,
  NOTE_SLOT_SOURCE,
} from '../constants/noteEditor';
import {
  buildGroupTitle,
  isMediaBatch,
  moveAttachmentInGroup,
  renameAttachmentGroup,
  setAttachmentCaption,
  withAttachmentGroup,
} from '../lib/attachmentGroups';
import type { NoteAttachment } from '../types/noteAttachment';
import type { NoteMediaSource } from '../types/noteFormat';

interface SlotTarget {
  groupId: string;
  title: string;
}

export function useNoteAttachments(
  setAttachments: Dispatch<SetStateAction<NoteAttachment[]>>,
  onGroupAdded: (groupId: string) => void,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<SlotTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback((source: NoteMediaSource, target: SlotTarget | null = null) => {
    const input = inputRef.current;
    if (!input) return;
    targetRef.current = target;
    input.accept = NOTE_MEDIA_ACCEPT[source];
    if (source === 'camera') input.setAttribute('capture', 'environment');
    else input.removeAttribute('capture');
    input.click();
  }, []);

  const pickForSlot = useCallback(
    (groupId: string, title: string, kind: MarkdownSlotKind) => {
      openPicker(NOTE_SLOT_SOURCE[kind], { groupId, title });
    },
    [openPicker],
  );

  const addFiles = useCallback(
    async (files: readonly File[], target: SlotTarget | null) => {
      const accepted: NoteAttachment[] = [];
      let nextError: string | null = null;

      for (const file of files) {
        if (file.size > MAX_NOTE_ATTACHMENT_SIZE) {
          nextError = `Файл «${file.name}» завеликий (максимум ${MAX_NOTE_ATTACHMENT_SIZE_LABEL})`;
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
      if (accepted.length === 0) return;

      if (target) {
        setAttachments((previous) =>
          previous.concat(
            withAttachmentGroup(
              accepted,
              target.groupId,
              previous.find(({ groupId }) => groupId === target.groupId)?.groupTitle ??
                target.title,
            ),
          ),
        );
        return;
      }

      const groupId = createId();
      const isMedia = isMediaBatch(accepted);
      setAttachments((previous) =>
        previous.concat(withAttachmentGroup(accepted, groupId, buildGroupTitle(previous, isMedia))),
      );
      onGroupAdded(groupId);
        },
    [setAttachments, onGroupAdded],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const files = Array.from(input.files ?? []);
      const target = targetRef.current;
      targetRef.current = null;
      input.value = '';
      if (files.length > 0) void addFiles(files, target);
    },
    [addFiles],
  );

  const remove = useCallback(
    (id: string) => {
      setError(null);
      setAttachments((previous) => previous.filter((item) => item.id !== id));
    },
    [setAttachments],
  );

  const renameGroup = useCallback(
    (groupId: string, title: string) => {
      setAttachments((previous) => renameAttachmentGroup(previous, groupId, title));
    },
    [setAttachments],
  );

  const setCaption = useCallback(
    (id: string, caption: string) => {
      setAttachments((previous) => setAttachmentCaption(previous, id, caption));
    },
    [setAttachments],
  );

  const move = useCallback(
    (id: string, direction: -1 | 1) => {
      setAttachments((previous) => moveAttachmentInGroup(previous, id, direction));
    },
    [setAttachments],
  );

  return {
    inputRef,
    error,
    openPicker,
    pickForSlot,
    handleChange,
    remove,
    renameGroup,
    setCaption,
    move,
  };
}