import type { Task } from '../../model/types/task';
import { countChecklistItems } from '../checklistTree';
import type { ChecklistItemCount } from '../checklistTree';

export interface TaskIndicators {
  checklist: ChecklistItemCount | null;
  comments: number;
  attachments: number;
}

export const getTaskIndicators = (task: Task): TaskIndicators => {
  const counts = (task.checklists ?? []).map((checklist) => countChecklistItems(checklist.items));
  const total = counts.reduce((sum, count) => sum + count.total, 0);
  const done = counts.reduce((sum, count) => sum + count.done, 0);

  return {
    checklist: total > 0 ? { done, total } : null,
    comments: task.comments?.length ?? 0,
    attachments: task.attachments?.length ?? 0,
  };
};