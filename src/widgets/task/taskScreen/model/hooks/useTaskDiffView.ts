import { useGetCategoriesQuery } from '@/entities/category';
import { useGetProjectsQuery } from '@/entities/project';
import { buildTaskDetails } from '@/entities/task';
import type { Task } from '@/entities/task';
import { resolveWorkspaceId } from '@/entities/workspace';
import { useSelectedDate } from '@/features/day/selectDate';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';

export function useTaskDiffView(task: Task) {
  const { data: categories } = useGetCategoriesQuery();
  const { data: projects } = useGetProjectsQuery();
  const { selectedDate } = useSelectedDate();
  const { workspaces } = useActiveWorkspace();

  return {
    category: categories?.find((item) => item.id === task.categoryId),
    project: task.projectId ? projects?.find((item) => item.id === task.projectId) : undefined,
    workspace: workspaces.find((item) => item.id === resolveWorkspaceId(task.workspaceId)),
    status: buildTaskDetails(task, selectedDate).status,
  };
}