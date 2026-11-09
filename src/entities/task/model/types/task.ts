import type { CategoryId } from '@/entities/category';
import type { TaskPriority } from './taskPriority';
import type { TaskSchedule } from './taskSchedule';
import type { TaskStatus } from './taskStatus';

export type TaskSubtask = {
  id: string;
  title: string;
  done: boolean;
  description?: string;
  priority?: TaskPriority;
  subtasks?: TaskSubtask[];
  date?: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  checklists?: TaskChecklist[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  createdAt?: number;
  statusLog?: TaskStatusChange[];
  changeLog?: TaskFieldChange[];
};

export type TaskComment = {
  id: string;
  text: string;
  createdAt: number;
};

export type TaskChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  children?: TaskChecklistItem[];
};

export type TaskChecklist = { id: string; title: string; items: TaskChecklistItem[] };

export type TaskTimer = {
  enabled: boolean;
  elapsedMsByDate: Record<string, number>;
  running: { dateKey: string; since: number } | null;
};

export type TaskStatusChange = {
  id: string;
  status: 'active' | 'done' | 'postponed';
  changedAt: number;
};

export type TaskFieldChange = {
  id: string;
  field: 'title' | 'description' | 'priority' | 'date' | 'time' | 'category' | 'project' | 'schedule';
  value: string | null;
  changedAt: number;
};

export type TaskAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  blobId: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  categoryId: CategoryId;
  projectId: string | null;
  workspaceId?: string;
  date: string;
  endDate?: string | null;
  startTime: string | null;
  endTime: string | null;
  status: TaskStatus;
  schedule?: TaskSchedule;
  weekdays?: number[];
  completedDates?: string[];
  skippedDates?: string[];
  priority?: TaskPriority;
  subtasks?: TaskSubtask[];
  checklists?: TaskChecklist[];
  comments?: TaskComment[];
  timer?: TaskTimer;
  attachments?: TaskAttachment[];
  createdAt?: number;
  statusLog?: TaskStatusChange[];
  changeLog?: TaskFieldChange[];
};

export type NewTask = Omit<Task, 'id'>;

export type TaskContentPatch = Pick<
  NewTask,
  'subtasks' | 'checklists' | 'attachments' | 'comments'
>;

export type DeletedTask = { record: Task; index: number };