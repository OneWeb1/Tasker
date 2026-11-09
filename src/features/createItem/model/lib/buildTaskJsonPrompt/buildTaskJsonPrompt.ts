import type { Category } from '@/entities/category';
import { TASK_PRIORITY_LABELS, TASK_SCHEDULES, TASK_WEEKDAYS } from '@/entities/task';
import { buildJsonPrompt } from '@/shared/lib/utils/json';
import type { JsonPromptField } from '@/shared/lib/utils/json';
import { DESCRIPTION_MAX_LENGTH } from '../../constants/createItem';
import { createTaskJsonExample } from '../../constants/jsonExamples';

export interface TaskJsonPromptContext {
  today: string;
  categories: readonly Category[];
}

export const PRIORITIES = Object.entries(TASK_PRIORITY_LABELS)
  .map(([value, label]) => `"${value}" — ${label}`)
  .join(', ');

const SCHEDULES = TASK_SCHEDULES.map(({ value, label }) => `"${value}" — ${label}`).join(', ');

const WEEKDAYS = TASK_WEEKDAYS.map(({ value, fullLabel }) => `${value} — ${fullLabel}`).join(', ');

export const TASK_JSON_FIELDS: readonly JsonPromptField[] = [
  { name: 'title', type: 'рядок', required: true, description: 'Назва завдання.' },
  {
    name: 'description',
    type: 'рядок',
    description: `Короткий опис, до ${DESCRIPTION_MAX_LENGTH} символів.`,
  },
  {
    name: 'categoryId',
    type: 'рядок',
    description: 'Ідентифікатор категорії лише зі списку доступних категорій.',
  },
  {
    name: 'projectId',
    type: 'рядок',
    description: 'Ідентифікатор проєкту. Вказуй, лише якщо користувач явно його надав.',
  },
  {
    name: 'date',
    type: 'рядок РРРР-ММ-ДД',
    description: 'Дата завдання, не раніше за сьогоднішню.',
  },
  {
    name: 'startTime',
    type: 'рядок ГГ:ХХ',
    description: 'Час початку (24 години). Вказуй завжди разом з endTime.',
  },
  {
    name: 'endTime',
    type: 'рядок ГГ:ХХ',
    description: 'Час завершення, пізніший за startTime. Вказуй завжди разом зі startTime.',
  },
  {
    name: 'schedule',
    type: 'рядок',
    description: `Повторення. Допустимі значення: ${SCHEDULES}. За замовчуванням "once".`,
  },
  {
    name: 'weekdays',
    type: 'масив чисел',
    description: `Дні тижня, лише для schedule "weekly". Допустимі значення: ${WEEKDAYS}.`,
  },
  {
    name: 'priority',
    type: 'рядок',
    description: `Пріоритет. Допустимі значення: ${PRIORITIES}.`,
  },
  {
    name: 'subtasks',
    type: 'масив об’єктів',
    description: `Підзавдання: { "title": рядок (обов’язково), "done": true/false, "description": рядок, "priority": ${PRIORITIES}, "date": РРРР-ММ-ДД, "endDate": РРРР-ММ-ДД, "startTime": ГГ:ХХ, "endTime": ГГ:ХХ, "subtasks": [вкладені підзавдання тієї ж структури], "checklists": [чеклісти тієї ж структури] }.`,
  },
  {
    name: 'checklists',
    type: 'масив об’єктів',
    description:
      'Чеклісти: { "title": рядок, "items": [{ "title": рядок (обов’язково), "done": true/false, "children": [вкладені пункти тієї ж структури] }] }.',
  },
];

const buildContext = ({ today, categories }: TaskJsonPromptContext): string[] => {
  const context = [
    `Сьогодні: ${today}. Відносні дати («завтра», «у п’ятницю») перетворюй на конкретні РРРР-ММ-ДД.`,
  ];

  if (categories.length > 0) {
    const list = categories.map((item) => `"${item.id}" — ${item.title}`).join(', ');
    context.push(`Доступні категорії (id — назва): ${list}.`);
  }

  return context;
};

export const buildTaskJsonPrompt = (context: TaskJsonPromptContext): string =>
  buildJsonPrompt({
    subject: 'завдання',
    fields: TASK_JSON_FIELDS,
    context: buildContext(context),
    example: createTaskJsonExample(context.today),
  });