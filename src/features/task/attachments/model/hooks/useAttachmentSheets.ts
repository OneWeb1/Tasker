import { useCallback, useState } from 'react';
import type { TaskAttachment } from '@/entities/task';

type AttachmentSheet = 'preview' | 'menu' | 'delete';

export function useAttachmentSheets() {
  const [active, setActive] = useState<TaskAttachment | null>(null);
  const [sheet, setSheet] = useState<AttachmentSheet | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const close = useCallback(() => setSheet(null), []);

  const openPreview = useCallback((attachment: TaskAttachment) => {
    setActive(attachment);
    setSheet('preview');
  }, []);

  const openMenu = useCallback((attachment: TaskAttachment) => {
    setActive(attachment);
    setSheet('menu');
  }, []);

  const requestDelete = useCallback((ids: string[]) => {
    setDeleteIds(ids);
    setSheet('delete');
  }, []);

  return {
    active,
    deleteIds,
    isPreviewOpen: sheet === 'preview',
    isMenuOpen: sheet === 'menu',
    isDeleteOpen: sheet === 'delete',
    close,
    openPreview,
    openMenu,
    requestDelete,
  };
}