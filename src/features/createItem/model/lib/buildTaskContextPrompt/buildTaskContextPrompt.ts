import type { Category } from '@/entities/category';
import type { Task, TaskChecklist, TaskChecklistItem, TaskSubtask } from '@/entities/task';
import { buildJsonPrompt } from '@/shared/lib/utils/json';
import { createTaskJsonExample } from '../../constants/jsonExamples';
import { TASK_JSON_FIELDS } from '../buildTaskJsonPrompt/buildTaskJsonPrompt';

export interface TaskContextPromptOptions {
  today: string;
  categories: readonly Category[];
}

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const compact = (source: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(source).filter(([, value]) => !isEmpty(value)));

const serializeChecklistItem = (item: TaskChecklistItem): Record<string, unknown> =>
  compact({
    title: item.title,
    done: item.done,
    children: item.children?.map(serializeChecklistItem),
  });

const serializeChecklist = (checklist: TaskChecklist): Record<string, unknown> =>
  compact({ title: checklist.title, items: checklist.items.map(serializeChecklistItem) });

export const serializeSubtask = (subtask: TaskSubtask): Record<string, unknown> =>
  compact({
    title: subtask.title,
    done: subtask.done,
    description: subtask.description,
    priority: subtask.priority,
    date: subtask.date,
    endDate: subtask.endDate,
    startTime: subtask.startTime,
    endTime: subtask.endTime,
    subtasks: subtask.subtasks?.map(serializeSubtask),
    checklists: subtask.checklists?.map(serializeChecklist),
  });

export const serializeTask = (task: Task): Record<string, unknown> =>
  compact({
    title: task.title,
    description: task.description,
    categoryId: task.categoryId,
    projectId: task.projectId,
    date: task.date,
    endDate: task.endDate,
    startTime: task.startTime,
    endTime: task.endTime,
    schedule: task.schedule,
    weekdays: task.weekdays,
    priority: task.priority,
    subtasks: task.subtasks?.map(serializeSubtask),
    checklists: task.checklists?.map(serializeChecklist),
  });

const RULES: readonly string[] = [
  'Працюй із поточним завданням нижче: покращуй, доповнюй або виправляй його так, як попросить користувач.',
  'Поверни повний оновлений JSON завдання (а не лише зміни). Те, що користувач не просив змінювати, залиш без змін.',
  'Підзавдання можуть містити вкладені "subtasks" і "checklists" тієї ж структури.',
  'Пиши чіткі, конкретні, діючі формулювання; розбивай великі кроки на логічні підзавдання.',
];

export const buildTaskContextPrompt = (
  task: Task,
  { today, categories }: TaskContextPromptOptions,
): string => {
  const context = [
    `Сьогодні: ${today}. Відносні дати («завтра», «у п’ятницю») перетворюй на конкретні РРРР-ММ-ДД.`,
  ];

  if (categories.length > 0) {
    const list = categories.map((item) => `"${item.id}" — ${item.title}`).join(', ');
    context.push(`Доступні категорії (id — назва): ${list}.`);
  }

  return buildJsonPrompt({
    subject: 'завдання',
    intro:
      'Ти — досвідчений помічник застосунку-планувальника. Твоє завдання — професійно покращувати існуюче завдання: уточнювати опис, додавати підзавдання, чекліст, пріоритет і терміни.',
    fields: TASK_JSON_FIELDS,
    rules: RULES,
    context,
    example: createTaskJsonExample(today),
    outro: [
      'Поточне завдання (JSON):',
      JSON.stringify(serializeTask(task), null, 2),
      '',
      'Далі користувач опише, що саме потрібно покращити чи доповнити.',
    ].join('\n'),
  });
};