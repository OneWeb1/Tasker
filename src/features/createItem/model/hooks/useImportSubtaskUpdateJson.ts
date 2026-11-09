import { filterCategoriesByWorkspace, useGetCategoriesQuery } from '@/entities/category';
import { useGetProjectsQuery } from '@/entities/project';
import { resolveSubtaskTask } from '@/entities/task';
import type { NewTask, Task, TaskSubtask } from '@/entities/task';
import { filterByWorkspace, resolveWorkspaceId } from '@/entities/workspace';
import { useJsonImport } from '@/shared/lib/hooks/useJsonImport';
import { getTodayKey } from '@/shared/lib/utils/date';
import type { ParseResult } from '@/shared/lib/utils/json';
import { buildSubtaskContextPrompt } from '../lib/buildSubtaskContextPrompt';
import { buildTaskDiff } from '../lib/buildTaskDiff';
import type { TaskDiff } from '../lib/buildTaskDiff';
import { parseSubtaskJson } from '../lib/parseSubtaskJson';

export type SubtaskUpdate = Partial<Omit<TaskSubtask, 'id'>>;

const NOT_FOUND = 'Підзавдання не знайдено';
const notFound: ParseResult<never> = { ok: false, error: NOT_FOUND };

const toUpdate = (value: TaskSubtask): SubtaskUpdate => ({
  title: value.title,
  done: value.done,
  description: value.description ?? '',
  priority: value.priority,
  startTime: value.startTime ?? null,
  endTime: value.endTime ?? null,
  ...(value.date ? { date: value.date, endDate: value.endDate ?? null } : {}),
  ...(value.subtasks ? { subtasks: value.subtasks } : {}),
  ...(value.checklists ? { checklists: value.checklists } : {}),
});

const toNewTask = (value: TaskSubtask, base: Task): NewTask => ({
  title: value.title,
  description: value.description,
  categoryId: base.categoryId,
  projectId: base.projectId,
  workspaceId: base.workspaceId,
  date: value.date ?? base.date,
  startTime: value.startTime ?? null,
  endTime: value.endTime ?? null,
  status: value.done ? 'done' : 'active',
  priority: value.priority,
  subtasks: value.subtasks,
  checklists: value.checklists,
});

export function useImportSubtaskUpdateJson(
  root: Task,
  subtaskId: string,
  onApply: (patch: SubtaskUpdate) => void,
  onApplied: () => void,
) {
  const { data: allCategories = [] } = useGetCategoriesQuery();
  const { data: projects = [] } = useGetProjectsQuery();

  const workspaceId = resolveWorkspaceId(root.workspaceId);
  const categories = filterCategoriesByWorkspace(allCategories, workspaceId);
  const workspaceProjects = filterByWorkspace(projects, workspaceId);
  const target = resolveSubtaskTask(root, subtaskId)?.task;

  const parse = (raw: string): ParseResult<TaskSubtask> =>
    target ? parseSubtaskJson(raw) : notFound;

  const importJson = async (raw: string): Promise<ParseResult<unknown>> => {
    const result = parse(raw);
    if (result.ok) {
      onApply(toUpdate(result.value));
      onApplied();
    }
    return result;
  };

  const buildPreview = (raw: string) => {
    const result = parse(raw);
    return result.ok ? { text: '', isInvalid: false } : { text: result.error, isInvalid: true };
  };

  const buildDiff = (raw: string): ParseResult<TaskDiff> => {
    if (!target) return notFound;
    const result = parseSubtaskJson(raw);
    if (!result.ok) return result;
    return {
      ok: true,
      value: buildTaskDiff(target, toNewTask(result.value, target), {
        categories,
        projects: workspaceProjects,
      }),
    };
  };

  const importState = useJsonImport(importJson);
  const prompt = buildSubtaskContextPrompt(root, subtaskId, { today: getTodayKey() });

  return { ...importState, prompt, buildPreview, buildDiff };
}