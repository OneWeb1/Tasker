import type {
  FieldDiff,
  NewTask,
  Task,
  TaskChecklist,
  TaskChecklistItem,
  TaskDiffValue,
  TaskFieldDiffs,
  TaskSubtask,
} from '@/entities/task';
import { TASK_PRIORITY_LABELS, TASK_SCHEDULES, TASK_WEEKDAYS } from '@/entities/task';
import { formatShortDate } from '@/shared/lib/utils/date';
import type { DiffKind } from '@/shared/ui/DiffSign';

interface Titled {
  id: string;
  title: string;
  emoji?: string;
}

export interface TaskDiffLabels {
  categories: readonly Titled[];
  projects: readonly Titled[];
}

export interface TaskDiff extends TaskDiffValue {
  task: Task;
  changesCount: number;
}

interface RawNode {
  title: string;
  description: string;
  done: boolean;
  source: TaskSubtask | null;
  children: RawNode[];
  checklists: RawNode[];
}

interface DiffNode {
  key: string;
  title: string;
  description: string;
  done: boolean;
  source: TaskSubtask | null;
  kind: DiffKind;
  children: DiffNode[];
  checklists: DiffNode[];
}

const NO_PRIORITY = 'Не вибрано';
const NO_PROJECT = 'Без проєкту';

const field = (before: string, after: string): FieldDiff => ({
  before,
  after,
  isChanged: before !== after,
});

const fromChecklistItem = (item: TaskChecklistItem): RawNode => ({
  title: item.title,
  description: '',
  done: item.done,
  source: null,
  children: (item.children ?? []).map(fromChecklistItem),
  checklists: [],
});

const fromChecklist = (checklist: TaskChecklist): RawNode => ({
  title: checklist.title,
  description: '',
  done: false,
  source: null,
  children: checklist.items.map(fromChecklistItem),
  checklists: [],
});

const fromSubtask = (item: TaskSubtask): RawNode => ({
  title: item.title,
  description: item.description?.trim() ?? '',
  done: item.done,
  source: item,
  children: (item.subtasks ?? []).map(fromSubtask),
  checklists: (item.checklists ?? []).map(fromChecklist),
});

const wholeNode = (node: RawNode, kind: 'added' | 'removed', key: string): DiffNode => ({
  key,
  title: node.title,
  description: node.description,
  done: node.done,
  source: node.source,
  kind,
  children: node.children.map((child, index) => wholeNode(child, kind, `${key}.${index}`)),
  checklists: node.checklists.map((child, index) => wholeNode(child, kind, `${key}~c${index}`)),
});

const diffNodes = (
  before: readonly RawNode[],
  after: readonly RawNode[],
  prefix: string,
): DiffNode[] => {
  const used = new Set<number>();
  const matches = after.map((node) => {
    const index = before.findIndex((item, i) => !used.has(i) && item.title === node.title);
    if (index >= 0) used.add(index);
    return index;
  });

  const result: DiffNode[] = [];
  let flushed = 0;
  const flushUntil = (limit: number) => {
    for (; flushed < limit; flushed += 1) {
      if (!used.has(flushed)) {
        result.push(wholeNode(before[flushed], 'removed', `${prefix}${result.length}`));
      }
    }
  };

  after.forEach((node, position) => {
    const index = matches[position];
    if (index < 0) {
      result.push(wholeNode(node, 'added', `${prefix}${result.length}`));
      return;
    }

    flushUntil(index);
    const previous = before[index];
    const key = `${prefix}${result.length}`;
    result.push({
      key,
      title: node.title,
      description: node.description,
      done: node.done,
      source: node.source,
      kind:
        previous.done !== node.done || previous.description !== node.description
          ? 'changed'
          : 'same',
      children: diffNodes(previous.children, node.children, `${key}.`),
      checklists: diffNodes(previous.checklists, node.checklists, `${key}~c`),
    });
  });

  flushUntil(before.length);
  return result;
};

type Marks = Map<string, DiffKind>;

const mark = (node: DiffNode, marks: Marks) => {
  if (node.kind !== 'same') marks.set(node.key, node.kind);
};

const toChecklistItem = (node: DiffNode, marks: Marks): TaskChecklistItem => {
  mark(node, marks);
  return {
    id: node.key,
    title: node.title,
    done: node.done,
    children: node.children.map((child) => toChecklistItem(child, marks)),
  };
};

const toChecklist = (node: DiffNode, marks: Marks): TaskChecklist => {
  mark(node, marks);
  return {
    id: node.key,
    title: node.title,
    items: node.children.map((child) => toChecklistItem(child, marks)),
  };
};

const toSubtask = (node: DiffNode, marks: Marks): TaskSubtask => {
  mark(node, marks);
  return {
    ...node.source,
    id: node.key,
    title: node.title,
    done: node.done,
    description: node.description || undefined,
    subtasks: node.children.map((child) => toSubtask(child, marks)),
    checklists: node.checklists.map((child) => toChecklist(child, marks)),
  };
};

const formatDates = (date: string, start: string | null, end: string | null): string =>
  start && end ? `${formatShortDate(date)} ${start}–${end}` : formatShortDate(date);

const formatWeekdays = (weekdays: readonly number[] | undefined): string =>
  (weekdays ?? [])
    .map((value) => TASK_WEEKDAYS.find((item) => item.value === value)?.label)
    .filter(Boolean)
    .join(', ');

const formatSchedule = (schedule: Task['schedule']): string =>
  TASK_SCHEDULES.find((item) => item.value === (schedule ?? 'once'))?.label ?? '';

const formatTitled = (list: readonly Titled[], id: string | null, fallback: string): string => {
  if (id === null) return fallback;
  const item = list.find((entry) => entry.id === id);
  if (!item) return id;
  return item.emoji ? `${item.emoji} ${item.title}` : item.title;
};

export const buildTaskDiff = (
  task: Task,
  next: NewTask,
  { categories, projects }: TaskDiffLabels,
): TaskDiff => {
  const beforeSubtasks = (task.subtasks ?? []).map(fromSubtask);
  const afterSubtasks = next.subtasks ? next.subtasks.map(fromSubtask) : beforeSubtasks;
  const beforeChecklists = (task.checklists ?? []).map(fromChecklist);
  const afterChecklists = next.checklists ? next.checklists.map(fromChecklist) : beforeChecklists;

  const marks: Marks = new Map();
  const subtasks = diffNodes(beforeSubtasks, afterSubtasks, 's').map((node) =>
    toSubtask(node, marks),
  );
  const checklists = diffNodes(beforeChecklists, afterChecklists, 'c').map((node) =>
    toChecklist(node, marks),
  );

  const fields: TaskFieldDiffs = {
    title: field(task.title.trim(), next.title.trim()),
    description: field(task.description?.trim() ?? '', next.description?.trim() ?? ''),
    category: field(
      formatTitled(categories, task.categoryId, ''),
      formatTitled(categories, next.categoryId, ''),
    ),
    project: field(
      formatTitled(projects, task.projectId, NO_PROJECT),
      formatTitled(projects, next.projectId, NO_PROJECT),
    ),
    dates: field(
      formatDates(task.date, task.startTime, task.endTime),
      formatDates(next.date, next.startTime, next.endTime),
    ),
    schedule: field(formatSchedule(task.schedule), formatSchedule(next.schedule)),
    weekdays: field(formatWeekdays(task.weekdays), formatWeekdays(next.weekdays)),
    priority: field(
      task.priority ? TASK_PRIORITY_LABELS[task.priority] : NO_PRIORITY,
      next.priority ? TASK_PRIORITY_LABELS[next.priority] : NO_PRIORITY,
    ),
  };

  const changedFields = Object.values(fields).filter((item) => item.isChanged).length;

  return {
    task: {
      ...task,
      title: next.title,
      description: next.description,
      categoryId: next.categoryId,
      projectId: next.projectId,
      date: next.date,
      startTime: next.startTime,
      endTime: next.endTime,
      schedule: next.schedule,
      weekdays: next.weekdays,
      priority: next.priority,
      subtasks,
      checklists,
    },
    marks,
    fields,
    changesCount: changedFields + marks.size,
  };
};