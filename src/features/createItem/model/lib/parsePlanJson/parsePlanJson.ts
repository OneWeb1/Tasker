import {
  CATEGORY_COLOR_PRESETS,
  CATEGORY_EMOJIS,
  CATEGORY_TITLE_MAX_LENGTH,
  filterCategoriesByWorkspace,
  isHexColor,
} from '@/entities/category';
import type { Category, CategoryColor } from '@/entities/category';
import { NEW_PROJECT_EMOJI, PROJECT_TITLE_MAX_LENGTH } from '@/entities/project';
import type { Project } from '@/entities/project';
import type { NewTask } from '@/entities/task';
import {
  NEW_WORKSPACE_EMOJI,
  WORKSPACE_TITLE_MAX_LENGTH,
  filterByWorkspace,
} from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';
import {
  JsonFieldError,
  guardJson,
  parseJsonObject,
  readOptionalArray,
  readOptionalString,
  readRecord,
  readRequiredString,
} from '@/shared/lib/utils/json';
import type { ParseResult } from '@/shared/lib/utils/json';
import { PLAN_MAX_TASKS } from '../../constants/createItem';
import { readTaskJson } from '../parseTaskJson';
import type { TaskJsonContext } from '../parseTaskJson';

export interface PlanJsonContext {
  today: string;
  activeWorkspace: Workspace;
  workspaces: readonly Workspace[];
  projects: readonly Project[];
  categories: readonly Category[];
}

export interface PlanEntity {
  id: string | null;
  title: string;
  emoji: string;
}

export interface PlanCategory extends PlanEntity {
  color: CategoryColor;
  tasks: NewTask[];
}

export interface ParsedPlan {
  workspace: PlanEntity;
  project: PlanEntity | null;
  categories: PlanCategory[];
  taskCount: number;
}

type JsonSource = Record<string, unknown>;

interface Titled {
  id: string;
  title: string;
  emoji: string;
}

const PLACEHOLDER_ID = '__plan__';
const FALLBACK_COLOR = '#8b5cf6';
const FALLBACK_CATEGORY_EMOJI = '🎯';

const normalize = (title: string): string => title.trim().toLowerCase();

const withPath = <T>(path: string, read: () => T): T => {
  try {
    return read();
  } catch (error) {
    if (error instanceof JsonFieldError) throw new JsonFieldError(`${path}: ${error.message}`);
    throw error;
  }
};

const readEntity = (
  source: JsonSource,
  maxLength: number,
  fallbackEmoji: string,
  existing: readonly Titled[],
): PlanEntity => {
  const title = readRequiredString(source, 'title').slice(0, maxLength).trimEnd();
  const key = normalize(title);
  const match = existing.find((item) => normalize(item.title) === key);
  if (match) return { id: match.id, title: match.title, emoji: match.emoji };

  return { id: null, title, emoji: readOptionalString(source, 'emoji')?.trim() || fallbackEmoji };
};

const readSection = <T>(
  source: JsonSource,
  key: string,
  read: (section: JsonSource) => T,
): T | null => {
  const value = source[key];
  if (value === undefined || value === null) return null;
  return withPath(key, () => read(readRecord(value, key)));
};

const resolveColor = (
  source: JsonSource,
  entity: PlanEntity,
  categories: readonly Category[],
  used: ReadonlySet<string>,
): CategoryColor => {
  const existing = categories.find((category) => category.id === entity.id);
  if (existing) return existing.color;

  const explicit = readOptionalString(source, 'color')?.trim().toLowerCase();
  if (explicit !== undefined) {
    if (!isHexColor(explicit)) throw new JsonFieldError('Колір має бути у форматі #RRGGBB');
    return explicit;
  }

  return (
    CATEGORY_COLOR_PRESETS.find((color) => !used.has(color)) ??
    CATEGORY_COLOR_PRESETS[0] ??
    FALLBACK_COLOR
  );
};

const buildPlan = (source: JsonSource, context: PlanJsonContext): ParsedPlan => {
  const { activeWorkspace } = context;

  const workspace: PlanEntity = readSection(source, 'workspace', (section) =>
    readEntity(section, WORKSPACE_TITLE_MAX_LENGTH, NEW_WORKSPACE_EMOJI, context.workspaces),
  ) ?? { id: activeWorkspace.id, title: activeWorkspace.title, emoji: activeWorkspace.emoji };

  const existingProjects =
    workspace.id === null ? [] : filterByWorkspace(context.projects, workspace.id);
  const project = readSection(source, 'project', (section) =>
    readEntity(section, PROJECT_TITLE_MAX_LENGTH, NEW_PROJECT_EMOJI, existingProjects),
  );

  const rawCategories = readOptionalArray(source, 'categories');
  if (!rawCategories?.length) {
    throw new JsonFieldError('Додайте хоча б одну категорію у "categories"');
  }

  const taskContext: TaskJsonContext = {
    minDate: context.today,
    fallbackDate: context.today,
    defaultCategoryId: PLACEHOLDER_ID,
    categoryIds: [],
    projectIds: [],
    workspaceId: PLACEHOLDER_ID,
  };

  const scopedCategories =
    workspace.id === null ? [] : filterCategoriesByWorkspace(context.categories, workspace.id);
  const usedColors = new Set(scopedCategories.map((category) => category.color.toLowerCase()));
  const seenTitles = new Set<string>();

  const categories = rawCategories.map((value, index) =>
    withPath(`categories[${index}]`, (): PlanCategory => {
      const categorySource = readRecord(value, 'категорія');
      const entity = readEntity(
        categorySource,
        CATEGORY_TITLE_MAX_LENGTH,
        CATEGORY_EMOJIS[0] ?? FALLBACK_CATEGORY_EMOJI,
        scopedCategories,
      );

      const key = normalize(entity.title);
      if (seenTitles.has(key)) throw new JsonFieldError('Категорія вже є в плані');
      seenTitles.add(key);

      const color = resolveColor(categorySource, entity, scopedCategories, usedColors);
      usedColors.add(color);

      const tasks = (readOptionalArray(categorySource, 'tasks') ?? []).map((task, taskIndex) =>
        withPath(`tasks[${taskIndex}]`, () =>
          readTaskJson(readRecord(task, 'завдання'), taskContext),
        ),
      );

      return { ...entity, color, tasks };
    }),

  );

  const taskCount = categories.reduce((sum, category) => sum + category.tasks.length, 0);
  if (taskCount === 0) throw new JsonFieldError('План не містить жодного завдання');
  if (taskCount > PLAN_MAX_TASKS) {
    throw new JsonFieldError(
      `План завеликий: не більше ${PLAN_MAX_TASKS} завдань. Згенеруйте його частинами.`,
    );
  }

  return { workspace, project, categories, taskCount };
};

export const parsePlanJson = (raw: string, context: PlanJsonContext): ParseResult<ParsedPlan> => {
  const parsed = parseJsonObject(raw);
  if (!parsed.ok) return parsed;

  return guardJson(() => buildPlan(parsed.value, context));
};