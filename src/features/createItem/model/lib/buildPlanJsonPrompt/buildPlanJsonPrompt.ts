import { CATEGORY_TITLE_MAX_LENGTH } from '@/entities/category';
import { PROJECT_TITLE_MAX_LENGTH } from '@/entities/project';
import { WORKSPACE_TITLE_MAX_LENGTH } from '@/entities/workspace';
import { buildJsonPrompt } from '@/shared/lib/utils/json';
import type { JsonPromptField } from '@/shared/lib/utils/json';
import { PLAN_MAX_TASKS } from '../../constants/createItem';
import { createPlanJsonExample } from '../../constants/jsonExamples';
import { TASK_JSON_FIELDS } from '../buildTaskJsonPrompt/buildTaskJsonPrompt';

export interface PlanJsonPromptContext {
  today: string;
  activeWorkspaceTitle: string;
}

const EXCLUDED_TASK_FIELDS: readonly string[] = ['categoryId', 'projectId'];

const TASK_FIELDS: readonly JsonPromptField[] = TASK_JSON_FIELDS.filter(
  ({ name }) => !EXCLUDED_TASK_FIELDS.includes(name),
).map((field) => ({ ...field, name: `tasks[].${field.name}` }));

const PLAN_FIELDS: readonly JsonPromptField[] = [
  {
    name: 'workspace',
    type: 'об’єкт',
    description: `НЕ додавай це поле, якщо користувач прямо не попросив окремий інший простір. Тоді план додається в поточний простір користувача. Формат: { "title": рядок (обов’язково, до ${WORKSPACE_TITLE_MAX_LENGTH} символів), "emoji": один емодзі }. Якщо простору з такою назвою немає, буде створено новий і користувача буде в нього перемкнено.`,
  },
  {
    name: 'project',
    type: 'об’єкт',
    description: `{ "title": рядок (обов’язково, до ${PROJECT_TITLE_MAX_LENGTH} символів), "emoji": один емодзі }. Усі завдання плану належатимуть цьому проєкту. Назву добирай за змістом цілі.`,
  },
  {
    name: 'categories',
    type: 'масив об’єктів',
    required: true,
    description: `Категорії плану: { "title": рядок (обов’язково, до ${CATEGORY_TITLE_MAX_LENGTH} символів), "emoji": один емодзі, "color": "#RRGGBB", "tasks": [завдання] }. Категорія з такою назвою, що вже існує, використовується повторно.`,
  },
  ...TASK_FIELDS,
];

const RULES: readonly string[] = [
  'Весь план — один JSON-об’єкт із вкладеними категоріями та завданнями.',
  'Поле "workspace" не додавай, якщо користувач не просив створити або використати інший простір: інакше план потрапить у новий простір замість поточного.',
  'Не вказуй categoryId і projectId у завданнях: категорія визначається тим, у якій категорії лежить завдання.',
  `Назви простору, проєкту та категорій роби короткими: простір до ${WORKSPACE_TITLE_MAX_LENGTH}, проєкт до ${PROJECT_TITLE_MAX_LENGTH}, категорія до ${CATEGORY_TITLE_MAX_LENGTH} символів. Довші назви будуть обрізані.`,
  'Повторювані блоки описуй одним завданням, а не окремим на кожен день: для щоденних — schedule "weekly" і weekdays [1, 2, 3, 4, 5, 6, 0], для інших — відповідні weekdays.',
  'Для цілей на тиждень, місяць чи рік використовуй schedule "week", "month" або "year".',
  `У відповіді має бути не більше ${PLAN_MAX_TASKS} завдань. Великий план видавай частинами (наприклад, по одному кварталу), повторюючи ту саму назву простору, проєкту й категорій — вони доповнюються, а не дублюються.`,
];

export const buildPlanJsonPrompt = ({ today, activeWorkspaceTitle }: PlanJsonPromptContext): string =>
  buildJsonPrompt({
    subject: 'плану: робочого простору, проєкту, категорій, завдань і підзавдань',
    fields: PLAN_FIELDS,
    rules: RULES,
    context: [
      `Сьогодні: ${today}. Усі дати завдань — не раніше за сьогодні, у форматі РРРР-ММ-ДД.`,
      `Поточний простір користувача: "${activeWorkspaceTitle}". Без поля "workspace" план додається саме в нього, існуючі категорії з тією ж назвою доповнюються.`,
    ],
    example: createPlanJsonExample(today),
  });