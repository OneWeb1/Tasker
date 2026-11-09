import { useMemo } from 'react';
import type { Task, TaskComment } from '@/entities/task';
import { useTaskHistory } from './useTaskHistory';
import type { TaskHistoryItem } from './useTaskHistory';

export type ActivityBlock =
  | { kind: 'history'; id: string; items: TaskHistoryItem[] }
  | { kind: 'comments'; id: string; comments: TaskComment[] };

export function useActivityFeed(task: Task, comments: readonly TaskComment[]): ActivityBlock[] {
  const history = useTaskHistory(task);

  return useMemo(() => {
    const events = [
      ...history.map((item) => ({ at: item.at, item })),
      ...comments.map((comment) => ({ at: comment.createdAt, comment })),
    ].sort((a, b) => a.at - b.at);

    const blocks: ActivityBlock[] = [];
    for (const event of events) {
      const last = blocks[blocks.length - 1];
      if ('item' in event) {
        if (last?.kind === 'history') last.items.push(event.item);
        else blocks.push({ kind: 'history', id: event.item.id, items: [event.item] });
      } else if (last?.kind === 'comments') {
        last.comments.push(event.comment);
      } else {
        blocks.push({ kind: 'comments', id: event.comment.id, comments: [event.comment] });
      }
    }
    return blocks;
  }, [comments, history]);
}