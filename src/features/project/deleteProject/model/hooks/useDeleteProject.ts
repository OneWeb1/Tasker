import { useCallback } from 'react';
import { useGetNotesQuery, useUpdateNoteMutation } from '@/entities/note';
import { useDeleteProjectMutation, useRestoreDeletedProjectMutation } from '@/entities/project';
import type { DeletedProject } from '@/entities/project';
import { useGetTasksQuery, useUpdateTaskMutation } from '@/entities/task';

export interface RemovedProject {
  snapshot: DeletedProject;
  taskIds: string[];
  noteIds: string[];
}

export function useDeleteProject() {
  const [deleteProjectMutation] = useDeleteProjectMutation();
  const [restoreDeletedProject] = useRestoreDeletedProjectMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [updateNote] = useUpdateNoteMutation();
  const { data: tasks } = useGetTasksQuery();
  const { data: notes } = useGetNotesQuery();

  const setTasksProject = useCallback(
    async (taskIds: readonly string[], projectId: string | null): Promise<void> => {
      for (const id of taskIds) {
        await updateTask({ id, patch: { projectId } })
          .unwrap()
          .catch(() => undefined);
      }
    },
        [updateTask],
  );

  const setNotesProject = useCallback(
    async (noteIds: readonly string[], projectId: string | null): Promise<void> => {
      for (const id of noteIds) {
        await updateNote({ id, patch: { projectId } })
          .unwrap()
          .catch(() => undefined);
      }
    },
    [updateNote],
  );

  const deleteProjects = useCallback(
    async (ids: readonly string[]): Promise<RemovedProject[]> => {
      const removed: RemovedProject[] = [];
      for (const id of ids) {
        const snapshot = await deleteProjectMutation(id)
          .unwrap()
          .catch(() => null);
        if (!snapshot) continue;
        const taskIds = (tasks ?? [])
          .filter((task) => task.projectId === id)
          .map((task) => task.id);
        await setTasksProject(taskIds, null);
        const noteIds = (notes ?? [])
          .filter((note) => note.projectId === id)
          .map((note) => note.id);
        await setNotesProject(noteIds, null);
        removed.push({ snapshot, taskIds, noteIds });
      }
      return removed;
    },
    [deleteProjectMutation, notes, setNotesProject, setTasksProject, tasks],
  );

  const undoDeleteProjects = useCallback(
    async (removed: readonly RemovedProject[]): Promise<void> => {
      for (const { snapshot, taskIds, noteIds } of [...removed].reverse()) {
        await restoreDeletedProject(snapshot)
          .unwrap()
          .catch(() => undefined);
        await setTasksProject(taskIds, snapshot.record.id);
        await setNotesProject(noteIds, snapshot.record.id);
      }
    },
    [restoreDeletedProject, setNotesProject, setTasksProject],
  );

  return { deleteProjects, undoDeleteProjects };
}