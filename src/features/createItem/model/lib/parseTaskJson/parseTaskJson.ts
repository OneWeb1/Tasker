import type { CategoryId } from '@/entities/category';
import { TASK_PRIORITY_LABELS, TASK_SCHEDULES, TASK_WEEKDAYS } from '@/entities/task';
import type {
  NewTask,
  TaskChecklist,
  TaskChecklistItem,
  TaskPriority,
  TaskSchedule,
  TaskSubtask,
} from '@/entities/task';
import { createId } from '@/shared/lib/utils/createId';
import { parseDateKey } from '@/shared/lib/utils/date';
import {
  JsonFieldError,
  guardJson,
  parseJsonObject,
  readOptionalArray,
  readOptionalBoolean,
  readOptionalString,
  readRecord,
  readRequiredString,
} from '@/shared/lib/utils/json';
import type { ParseResult } from '@/shared/lib/utils/json';
import { DESCRIPTION_MAX_LENGTH } from '../../constants/createItem';
import { isCreateItemValid } from '../isCreateItemValid';

export interface TaskJsonContext {
  minDate: string;
  fallbackDate: string;
  defaultCategoryId: CategoryId;
  categoryIds: readonly CategoryId[];
  projectIds: readonly string[];
  workspaceId: string;
}

type JsonSource = Record<string, unknown>;

const DEFAULT_CHECKLIST_TITLE = 'Чекліст';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const SCHEDULE_VALUES: readonly string[] = TASK_SCHEDULES.map((item) => item.value);
const WEEKDAY_VALUES: readonly number[] = TASK_WEEKDAYS.map((item) => item.value);

const isSchedule = (value: string): value is TaskSchedule => SCHEDULE_VALUES.includes(value);

const isPriority = (value: string): value is TaskPriority =>
  Object.prototype.hasOwnProperty.call(TASK_PRIORITY_LABELS, value);

const readPriority = (source: JsonSource): TaskPriority | undefined => {
  const value = readOptionalString(source, 'priority');
  if (value === undefined) return undefined;
  if (!isPriority(value)) throw new JsonFieldError(`Невідомий пріоритет "${value}"`);
  return value;
};

const readSchedule = (source: JsonSource): TaskSchedule => {
  const value = readOptionalString(source, 'schedule') ?? 'once';
  if (!isSchedule(value)) throw new JsonFieldError(`Невідоме повторення "${value}"`);
  return value;
};

const readWeekdays = (source: JsonSource, schedule: TaskSchedule, date: string): number[] => {
  if (schedule !== 'weekly') return [];

  const values = readOptionalArray(source, 'weekdays');
  if (!values?.length) return [parseDateKey(date).getDay()];

  const weekdays = values.map((value) => {
    if (typeof value !== 'number' || !WEEKDAY_VALUES.includes(value)) {
      throw new JsonFieldError('Поле "weekdays" має містити номери днів тижня');
    }
    return value;
  });
  return [...new Set(weekdays)].sort((a, b) => a - b);
};

const readChecklistItem = (value: unknown): TaskChecklistItem => {
  const source = readRecord(value, 'пункт чекліста');
  const children = readOptionalArray(source, 'children')?.map(readChecklistItem);

  return {
    id: createId(),
    title: readRequiredString(source, 'title'),
    done: readOptionalBoolean(source, 'done') ?? false,
    ...(children?.length ? { children } : {}),
  };
};

const readChecklist = (value: unknown): TaskChecklist => {
  const source = readRecord(value, 'чекліст');

  return {
    id: createId(),
    title: readOptionalString(source, 'title')?.trim() || DEFAULT_CHECKLIST_TITLE,
    items: (readOptionalArray(source, 'items') ?? []).map(readChecklistItem),
  };
};

const readOptionalDate = (source: JsonSource, key: string): string | undefined => {
  const value = readOptionalString(source, key);
  if (value === undefined) return undefined;
  if (!DATE_PATTERN.test(value) || Number.isNaN(parseDateKey(value).getTime())) {
    throw new JsonFieldError(`Поле "${key}" має бути у форматі РРРР-ММ-ДД`);
  }
  return value;
};

const readOptionalTime = (source: JsonSource, key: string): string | undefined => {
  const value = readOptionalString(source, key);
  if (value === undefined) return undefined;
  if (!TIME_PATTERN.test(value)) throw new JsonFieldError(`Поле "${key}" має бути у форматі ГГ:ХХ`);
  return value;
};

export const readSubtask = (value: unknown): TaskSubtask => {
  const source = readRecord(value, 'підзавдання');
  const description = readOptionalString(source, 'description')?.trim();
  const priority = readPriority(source);
  const date = readOptionalDate(source, 'date');
  const endDate = readOptionalDate(source, 'endDate');
  const startTime = readOptionalTime(source, 'startTime');
  const endTime = readOptionalTime(source, 'endTime');
  const subtasks = readOptionalArray(source, 'subtasks')?.map(readSubtask);
  const checklists = readOptionalArray(source, 'checklists')?.map(readChecklist);

  return {
    id: createId(),
    title: readRequiredString(source, 'title'),
    done: readOptionalBoolean(source, 'done') ?? false,
    ...(description ? { description } : {}),
    ...(priority ? { priority } : {}),
    ...(date ? { date } : {}),
    ...(endDate ? { endDate } : {}),
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    ...(subtasks?.length ? { subtasks } : {}),
    ...(checklists?.length ? { checklists } : {}),
  };
};

export const readTaskJson = (source: JsonSource, context: TaskJsonContext): NewTask => {
  const title = readRequiredString(source, 'title');

  const description = readOptionalString(source, 'description')?.trim() ?? '';
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new JsonFieldError(`Опис не довший за ${DESCRIPTION_MAX_LENGTH} символів`);
  }

  const categoryId = readOptionalString(source, 'categoryId') ?? context.defaultCategoryId;
  if (!context.categoryIds.includes(categoryId) && categoryId !== context.defaultCategoryId) {
    throw new JsonFieldError(`Категорію "${categoryId}" не знайдено`);
  }

  const projectId = readOptionalString(source, 'projectId') || null;
  if (projectId !== null && !context.projectIds.includes(projectId)) {
    throw new JsonFieldError(`Проєкт "${projectId}" не знайдено`);
  }

  const date = readOptionalString(source, 'date') ?? context.fallbackDate;
  if (!DATE_PATTERN.test(date) || Number.isNaN(parseDateKey(date).getTime())) {
    throw new JsonFieldError('Дата має бути у форматі РРРР-ММ-ДД');
  }

  const startTime = readOptionalString(source, 'startTime') ?? null;
  const endTime = readOptionalString(source, 'endTime') ?? null;
  if ((startTime === null) !== (endTime === null)) {
    throw new JsonFieldError('Вкажіть і "startTime", і "endTime"');
  }
  if (
    startTime !== null &&
    endTime !== null &&
    (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime))
  ) {
    throw new JsonFieldError('Час має бути у форматі ГГ:ХХ');
  }

  const schedule = readSchedule(source);
  const weekdays = readWeekdays(source, schedule, date);

  const isValid = isCreateItemValid({
    kind: 'task',
    title,
    date,
    minDate: context.minDate,
    schedule,
    weekdays,
    hasTime: startTime !== null && endTime !== null,
    startTime: startTime ?? '',
    endTime: endTime ?? '',
  });
  if (!isValid) {
    throw new JsonFieldError('Перевірте дату (не в минулому) та час (кінець пізніше початку)');
  }

  const subtasks = readOptionalArray(source, 'subtasks')?.map(readSubtask);
  const checklists = readOptionalArray(source, 'checklists')?.map(readChecklist);

  return {
    title,
    description,
    categoryId,
    projectId,
    workspaceId: context.workspaceId,
    date,
    startTime,
    endTime,
    schedule,
    weekdays,
    priority: readPriority(source),
    status: 'active',
    ...(subtasks ? { subtasks } : {}),
    ...(checklists ? { checklists } : {}),
  };
};

export const parseTaskJson = (raw: string, context: TaskJsonContext): ParseResult<NewTask> => {
  const parsed = parseJsonObject(raw);
  if (!parsed.ok) return parsed;

  return guardJson(() => readTaskJson(parsed.value, context));
};