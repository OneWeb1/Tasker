import type { TaskChecklist } from '../../model/types/task';
import { countChecklistItems } from '../checklistTree';

export interface ChecklistProgress {
  done: number;
  total: number;
  percent: number;
}

export const getChecklistProgress = (checklist: TaskChecklist): ChecklistProgress => {
  const { done, total } = countChecklistItems(checklist.items);

  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
};