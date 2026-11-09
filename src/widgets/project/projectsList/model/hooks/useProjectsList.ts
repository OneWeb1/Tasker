import { useMemo } from 'react';
import { useGetProjectsQuery } from '@/entities/project';
import { useGetTasksQuery } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';

export function useProjectsList() {
  const { data: projects } = useGetProjectsQuery();
  const { data: tasks } = useGetTasksQuery();
  const { workspace } = useActiveWorkspace();
  const workspaceId = workspace.id;

  return useMemo(
    () =>
      filterByWorkspace(projects ?? [], workspaceId).map((project) => ({
        project,
        openTasksCount: (tasks ?? []).filter(
          (task) => task.projectId === project.id && task.status !== 'done',
        ).length,
      })),
    [projects, tasks, workspaceId],
  );
}