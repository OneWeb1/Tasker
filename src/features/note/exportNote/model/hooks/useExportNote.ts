import { useCallback } from 'react';
import { buildNoteMarkdownFile } from '@/entities/note';
import type { Note } from '@/entities/note';
import { saveFile } from '@/shared/lib/utils/file';
import { useToast } from '@/shared/ui/Toast';

export function useExportNote() {
  const { showToast } = useToast();

  const exportNote = useCallback(
    async (note: Note) => {
      const file = buildNoteMarkdownFile(note);
      try {
        const isSaved = await saveFile(file.filename, file.content, file.mime);
        if (isSaved) showToast({ message: 'Нотатку експортовано' });
      } catch {
        showToast({ message: 'Не вдалося експортувати нотатку' });
      }
    },
    [showToast],
  );

  return { exportNote };
}