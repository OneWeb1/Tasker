import { useCallback, useState } from 'react';
import type { Task, TaskAttachment } from '@/entities/task';
import { downloadAttachment } from '../lib/downloadAttachment';
import { useAttachmentSelection } from './useAttachmentSelection';
import { useAttachmentSheets } from './useAttachmentSheets';
import { useAttachments } from './useAttachments';

export function useAttachmentsSection(task: Task) {
  const { attachments, error, addFiles, removeAttachments } = useAttachments(task);
  const { isActive: isSelecting, ids, start, toggle, cancel, isSelected } =
    useAttachmentSelection();
  const {
    active,
    deleteIds,
    isPreviewOpen,
    isMenuOpen,
    isDeleteOpen,
    close,
    openPreview,
    openMenu,
    requestDelete,
  } = useAttachmentSheets();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => setIsExpanded((current) => !current), []);

  const uploadFiles = useCallback(
    (files: File[]) => {
      void addFiles(files);
    },
    [addFiles],
  );

  const openAttachment = useCallback(
    (attachment: TaskAttachment) => {
      if (isSelecting) {
        toggle(attachment.id);
        return;
      }
      openPreview(attachment);
    },
    [isSelecting, openPreview, toggle],
  );

  const downloadSelected = useCallback(() => {
    attachments.filter((item) => isSelected(item.id)).forEach((item) => void downloadAttachment(item));
  }, [attachments, isSelected]);

  const deleteSelected = useCallback(() => requestDelete(ids), [ids, requestDelete]);

  const confirmDelete = useCallback(() => {
    removeAttachments(deleteIds);
    cancel();
    close();
  }, [cancel, close, deleteIds, removeAttachments]);

  const downloadActive = useCallback(() => {
    if (active) void downloadAttachment(active);
  }, [active]);

  const downloadActiveAndClose = useCallback(() => {
    downloadActive();
    close();
  }, [close, downloadActive]);

  const selectActive = useCallback(() => {
    if (active) start(active.id);
    close();
  }, [active, close, start]);

  const deleteActive = useCallback(() => {
    if (active) requestDelete([active.id]);
  }, [active, requestDelete]);

  return {
    attachments,
    error,
    isExpanded,
    isSelecting,
    selectedCount: ids.length,
    isSelected,
    active,
    deleteCount: deleteIds.length,
    isPreviewOpen,
    isMenuOpen,
    isDeleteOpen,
    toggleExpanded,
    uploadFiles,
    openAttachment,
    openMenu,
    cancelSelection: cancel,
    downloadSelected,
    deleteSelected,
    confirmDelete,
    downloadActive,
    downloadActiveAndClose,
    selectActive,
    deleteActive,
    closeSheet: close,
  };
}