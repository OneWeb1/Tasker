import type { Task, TaskSubtask } from '@/entities/task';
import { buildJsonPrompt } from '@/shared/lib/utils/json';
import type { JsonPromptField } from '@/shared/lib/utils/json';
import { createSubtaskJsonExample } from '../../constants/jsonExamples';
import {
  serializeSubtask,
  serializeTask,
} from '../buildTaskContextPrompt/buildTaskContextPrompt';
import { PRIORITIES } from '../buildTaskJsonPrompt/buildTaskJsonPrompt';

export interface SubtaskContextPromptOptions {
  today: string;
}

const SUBTASK_JSON_FIELDS: readonly JsonPromptField[] = [
  { name: 'title', type: 'рядок', required: true, description: 'Назва підзавдання.' },
  { name: 'done', type: 'true/false', description: 'Чи виконане підзавдання.' },
  { name: 'description', type: 'рядок', description: 'Короткий опис підзавдання.' },
  {
    name: 'priority',
    type: 'рядок',
    description: `Пріоритет. Допустимі значення: ${PRIORITIES}.`,
  },
  { name: 'date', type: 'рядок РРРР-ММ-ДД', description: 'Власна дата підзавдання.' },
  { name: 'endDate', type: 'рядок РРРР-ММ-ДД', description: 'Дата завершення, якщо це діапазон.' },
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
    name: 'subtasks',
    type: 'масив об’єктів',
    description:
      'Вкладені підзавдання тієї ж структури, що й це підзавдання (title, done, description, priority, date, endDate, startTime, endTime, subtasks, checklists).',
  },
  {
    name: 'checklists',
    type: 'масив об’єктів',
    description:
      'Чеклісти: { "title": рядок, "items": [{ "title": рядок (обов’язково), "done": true/false, "children": [вкладені пункти тієї ж структури] }] }.',
  },
];

const RULES: readonly string[] = [
  'Повне завдання верхнього рівня нижче — лише контекст, щоб ти розумів загальну мету та сусідні підзавдання.',
  'Змінюй виключно цільове підзавдання та його вміст: опис, терміни, вкладені підзавдання, чеклісти. Решту завдання не змінюй і не повертай.',
  'Поверни повний оновлений JSON саме цільового підзавдання (а не всього завдання і не лише зміни). Те, що користувач не просив змінювати, залиш без змін.',
  'Пиши чіткі, конкретні, діючі формулювання; розбивай великі кроки на логічні вкладені підзавдання.',
];

const findPath = (items: readonly TaskSubtask[], id: string): TaskSubtask[] | undefined => {
  for (const item of items) {
    if (item.id === id) return [item];
    const rest = item.subtasks ? findPath(item.subtasks, id) : undefined;
    if (rest) return [item, ...rest];
  }
  return undefined;
};

export const buildSubtaskContextPrompt = (
  root: Task,
  subtaskId: string,
  { today }: SubtaskContextPromptOptions,
): string => {
  const path = findPath(root.subtasks ?? [], subtaskId);
  if (!path) return '';

  const target = path[path.length - 1];
  const location = [root.title, ...path.map((item) => item.title)]
    .map((title) => `«${title}»`)
    .join(' → ');

  return buildJsonPrompt({
    subject: 'підзавдання',
    intro:
      'Ти — досвідчений помічник застосунку-планувальника. Тобі надано повне завдання верхнього рівня як контекст. Твоє завдання — професійно покращувати лише одне його підзавдання та вміст усередині нього: уточнювати опис, додавати вкладені підзавдання, чекліст, пріоритет і терміни.',
    fields: SUBTASK_JSON_FIELDS,
    rules: RULES,
    context: [
      `Сьогодні: ${today}. Відносні дати («завтра», «у п’ятницю») перетворюй на конкретні РРРР-ММ-ДД.`,
      `Цільове підзавдання розташоване за шляхом: ${location}. Змінюй лише його.`,
    ],
    example: createSubtaskJsonExample(today),
    outro: [
      'Повне завдання верхнього рівня (JSON, лише контекст):',
      JSON.stringify(serializeTask(root), null, 2),
      '',
      'Цільове підзавдання (JSON) — саме його потрібно змінити та повернути:',
      JSON.stringify(serializeSubtask(target), null, 2),
      '',
      'Далі користувач опише, що саме потрібно покращити чи доповнити в цьому підзавданні.',
    ].join('\n'),
  });
};