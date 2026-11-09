import { useCallback } from 'react';
import { useTaskPatch } from '@/entities/task';
import type { Task } from '@/entities/task';
import { createId } from '@/shared/lib/utils/createId';

export function useComments(task: Task) {
  const patchTask = useTaskPatch();
  const comments = task.comments ?? [];

  const addComment = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      patchTask(task.id, {
        comments: [...comments, { id: createId(), text: trimmed, createdAt: Date.now() }],
      });
    },
    [comments, patchTask, task.id],
  );

  const editComment = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      patchTask(task.id, {
        comments: comments.map((comment) =>
          comment.id === id ? { ...comment, text: trimmed } : comment,
        ),
      });
    },
    [comments, patchTask, task.id],
  );

  const deleteComment = useCallback(
    (id: string) => {
      patchTask(task.id, { comments: comments.filter((comment) => comment.id !== id) });
    },
    [comments, patchTask, task.id],
  );

  return { comments, addComment, editComment, deleteComment };
}