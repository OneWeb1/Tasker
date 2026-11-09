import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
} from '@/entities/category';
import { useCreateProjectMutation, useGetProjectsQuery } from '@/entities/project';
import { useCreateTasksMutation } from '@/entities/task';
import type { NewTask } from '@/entities/task';
import { useCreateWorkspaceMutation, useGetWorkspacesQuery } from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';
import { useJsonImport } from '@/shared/lib/hooks/useJsonImport';
import { getTodayKey } from '@/shared/lib/utils/date';
import type { ParseResult } from '@/shared/lib/utils/json';
import { buildPlanJsonPrompt } from '../lib/buildPlanJsonPrompt';
import { parsePlanJson } from '../lib/parsePlanJson';
import type { ParsedPlan } from '../lib/parsePlanJson';

export function useImportPlanJson(
  activeWorkspace: Workspace,
  onImported: (workspaceId: string) => void,
) {
  const { data: workspaces = [] } = useGetWorkspacesQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createWorkspace] = useCreateWorkspaceMutation();
  const [createProject] = useCreateProjectMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [createTasks] = useCreateTasksMutation();

  const applyPlan = async (plan: ParsedPlan): Promise<string> => {
    const workspaceId =
      plan.workspace.id ??
      (await createWorkspace({ title: plan.workspace.title, emoji: plan.workspace.emoji }).unwrap())
        .id;

    const projectId = plan.project
      ? (plan.project.id ??
        (
          await createProject({
            title: plan.project.title,
            emoji: plan.project.emoji,
            workspaceId,
          }).unwrap()
        ).id)
      : null;

    const tasks: NewTask[] = [];
    for (const category of plan.categories) {
      const categoryId =
        category.id ??
        (
          await createCategory({
            title: category.title,
            emoji: category.emoji,
            color: category.color,
            workspaceId,
          }).unwrap()
        ).id;
      tasks.push(...category.tasks.map((task) => ({ ...task, categoryId, projectId, workspaceId })));
    }

    await createTasks(tasks).unwrap();
    return workspaceId;

  };

  const importJson = async (raw: string): Promise<ParseResult<unknown>> => {
    const result = parsePlanJson(raw, {
      today: getTodayKey(),
      activeWorkspace,
      workspaces,
      projects,
      categories,
    });
    if (result.ok) onImported(await applyPlan(result.value));
    return result;
  };

  return {
    ...useJsonImport(importJson),
    prompt: buildPlanJsonPrompt({
      today: getTodayKey(),
      activeWorkspaceTitle: activeWorkspace.title,
    }),
  };
}