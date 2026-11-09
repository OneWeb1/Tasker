import { filterCategoriesByWorkspace, useGetCategoriesQuery } from '@/entities/category';
import { useGetProjectsQuery } from '@/entities/project';
import type { NewTask, Task } from '@/entities/task';
import { filterByWorkspace, resolveWorkspaceId } from '@/entities/workspace';
import { useJsonImport } from '@/shared/lib/hooks/useJsonImport';
import { getTodayKey } from '@/shared/lib/utils/date';
import type { ParseResult } from '@/shared/lib/utils/json';
import { buildTaskContextPrompt } from '../lib/buildTaskContextPrompt';
import { buildTaskDiff } from '../lib/buildTaskDiff';
import type { TaskDiff } from '../lib/buildTaskDiff';
import { parseTaskJson } from '../lib/parseTaskJson';
import { useSubmitItem } from './useSubmitItem';

const toPatch = (value: NewTask): Partial<NewTask> => ({
  title: value.title,
  description: value.description,
  categoryId: value.categoryId,
  projectId: value.projectId,
  date: value.date,
  startTime: value.startTime,
  endTime: value.endTime,
  schedule: value.schedule,
  weekdays: value.weekdays,
  priority: value.priority,
  ...(value.subtasks ? { subtasks: value.subtasks } : {}),
  ...(value.checklists ? { checklists: value.checklists } : {}),
});

export function useImportTaskUpdateJson(task: Task, onApplied: () => void) {
  const { data: allCategories = [] } = useGetCategoriesQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { submitTaskUpdate } = useSubmitItem();

  const workspaceId = resolveWorkspaceId(task.workspaceId);
  const categories = filterCategoriesByWorkspace(allCategories, workspaceId);

  const workspaceProjects = filterByWorkspace(projects, workspaceId);

  const parse = (raw: string) => {
    const today = getTodayKey();
    return parseTaskJson(raw, {
      minDate: task.date < today ? task.date : today,
      fallbackDate: task.date,
      defaultCategoryId: task.categoryId,
      categoryIds: categories.map((item) => item.id),
      projectIds: workspaceProjects.map((item) => item.id),
      workspaceId,
    });
  };

  const importJson = async (raw: string): Promise<ParseResult<unknown>> => {
    const result = parse(raw);
    if (result.ok) {
      await submitTaskUpdate(task.id, toPatch(result.value));
      onApplied();
    }
    return result;
  };

  const buildPreview = (raw: string) => {
    const result = parse(raw);
    return result.ok ? { text: '', isInvalid: false } : { text: result.error, isInvalid: true };
  };

  const buildDiff = (raw: string): ParseResult<TaskDiff> => {
    const result = parse(raw);
    if (!result.ok) return result;
    return {
      ok: true,
      value: buildTaskDiff(task, result.value, { categories, projects: workspaceProjects }),
    };
  };

  const importState = useJsonImport(importJson);
  const prompt = buildTaskContextPrompt(task, { today: getTodayKey(), categories });

  return { ...importState, prompt, buildPreview, buildDiff };
}