import { useCallback, useState } from 'react';
import type { TaskComment } from '@/entities/task';
import { useToast } from '@/shared/ui/Toast';

export type CommentSheetView = 'menu' | 'delete';

interface UseCommentActionsParams {
  editComment: (id: string, text: string) => void;
  deleteComment: (id: string) => void;
}

export function useCommentActions({ editComment, deleteComment }: UseCommentActionsParams) {
  const { showToast } = useToast();
  const [activeComment, setActiveComment] = useState<TaskComment | null>(null);
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CommentSheetView>('menu');

  const open = useCallback((comment: TaskComment) => {
    setActiveComment(comment);
    setView('menu');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const handleCopy = useCallback(() => {
    if (!activeComment) return;
    setIsOpen(false);
    navigator.clipboard.writeText(activeComment.text).then(
      () => showToast({ message: 'Текст скопійовано' }),
      () => showToast({ message: 'Не вдалося скопіювати' }),
    );
  }, [activeComment, showToast]);

  const startEdit = useCallback(() => {
    if (!activeComment) return;
    setIsOpen(false);
    setEditingComment(activeComment);
  }, [activeComment]);

  const cancelEdit = useCallback(() => setEditingComment(null), []);

  const saveEdit = useCallback(
    (text: string) => {
      if (!editingComment) return;
      editComment(editingComment.id, text);
      setEditingComment(null);
    },
    [editComment, editingComment],
  );

  const handleDelete = useCallback(() => {
    if (!activeComment) return;
    setIsOpen(false);
    deleteComment(activeComment.id);
  }, [activeComment, deleteComment]);

  return {
    open,
    editingText: editingComment?.text ?? null,
    saveEdit,
    cancelEdit,
    sheet: {
      comment: activeComment,
      isOpen,
      view,
      onClose: close,
      onViewChange: setView,
      onCopy: handleCopy,
      onEdit: startEdit,
      onDelete: handleDelete,
    },
  };
}