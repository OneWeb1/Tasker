import { useCallback, useMemo, useState } from 'react';
import { useGetProjectsQuery } from '@/entities/project';
import { useGetTasksQuery } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useDeleteProject } from '@/features/project/deleteProject';
import { useActiveProject } from '@/features/project/filterByProject';
import { useSettings } from '@/features/settings/managePreferences';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { useItemSelection } from '@/shared/lib/hooks/useItemSelection';
import { useToast } from '@/shared/ui/Toast';

export function useNavDrawer(onClose: () => void) {
  const { workspace } = useActiveWorkspace();
  const { data: allProjects } = useGetProjectsQuery();
  const { data: tasks } = useGetTasksQuery();
  const { activeProjectId, selectProject, clearProject } = useActiveProject();
  const { userName } = useSettings();
  const {
    selectedIds,
    isActive: isSelecting,
    pick,
    startMulti,
    clear: clearSelection,
  } = useItemSelection();
  const { deleteProjects, undoDeleteProjects } = useDeleteProject();
  const { showToast } = useToast();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const workspaceId = workspace.id;
  const projects = useMemo(
    () => filterByWorkspace(allProjects ?? [], workspaceId),
    [allProjects, workspaceId],
  );

  const items = useMemo(() => {
    const openCounts = new Map<string, number>();
    for (const task of tasks ?? []) {
      if (task.projectId && task.status !== 'done') {
        openCounts.set(task.projectId, (openCounts.get(task.projectId) ?? 0) + 1);
      }
    }
    return projects.map((project) => ({
      project,
      openTasksCount: openCounts.get(project.id) ?? 0,
    }));
  }, [projects, tasks]);

  const selectedCount = useMemo(
    () => items.filter(({ project }) => selectedIds.has(project.id)).length,
    [items, selectedIds],
  );

  const close = useCallback(() => {
    clearSelection();
    setIsDeleteOpen(false);
    onClose();
  }, [clearSelection, onClose]);

  const pickProject = useCallback(
    (id: string) => {
      if (id === activeProjectId) clearProject();
      else selectProject(id);
      close();
    },
    [activeProjectId, clearProject, close, selectProject],
  );

  const pressItem = useCallback(
    (id: string) => {
      if (isSelecting) pick(id);
      else pickProject(id);
    },
    [isSelecting, pick, pickProject],
  );

  const longPressItem = useCallback(
    (id: string) => {
      pick(id);
      if (!isSelecting) startMulti();
    },
    [isSelecting, pick, startMulti],
  );

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const requestDelete = useCallback(() => {
    if (selectedCount > 0) setIsDeleteOpen(true);
  }, [selectedCount]);
  const closeDelete = useCallback(() => setIsDeleteOpen(false), []);

  const confirmDelete = useCallback(() => {
    const ids = items
      .filter(({ project }) => selectedIds.has(project.id))
      .map(({ project }) => project.id);

    setIsDeleteOpen(false);
    clearSelection();
    if (ids.length === 0) return;
    onClose();

    void deleteProjects(ids).then((removed) => {
      if (removed.length === 0) {
        showToast({ message: 'Не вдалося видалити проєкти' });
        return;
      }
      if (
        activeProjectId &&
        removed.some(({ snapshot }) => snapshot.record.id === activeProjectId)
      ) {
        clearProject();
      }
      showToast({
        message: `Видалено проєктів: ${removed.length}`,
        actionLabel: 'Відмінити',
        onAction: () => void undoDeleteProjects(removed),
      });
    });

  }, [
    activeProjectId,
    clearProject,
    clearSelection,
    deleteProjects,
    items,
    onClose,
    selectedIds,
    showToast,
    undoDeleteProjects,
  ]);

  const openNewProject = useCallback(() => setIsNewProjectOpen(true), []);
  const closeNewProject = useCallback(() => setIsNewProjectOpen(false), []);

  return {
    items,
    projects,
    workspaceId,
    activeProjectId,
    userName,
    isNewProjectOpen,
    openNewProject,
    closeNewProject,
    close,
    pressItem,
    longPressItem,
    isSelecting,
    isSelected,
    selectedCount,
    cancelSelection: clearSelection,
    isDeleteOpen,
    requestDelete,
    closeDelete,
    confirmDelete,
  };
}