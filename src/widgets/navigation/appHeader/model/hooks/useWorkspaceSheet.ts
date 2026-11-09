import { useState } from 'react';
import { DEFAULT_WORKSPACE } from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';
import { useActiveProject } from '@/features/project/filterByProject';
import { useDeleteWorkspace } from '@/features/workspace/deleteWorkspace';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';

export type WorkspaceSheetView = 'list' | 'create' | 'actions' | 'rename' | 'delete';

export function useWorkspaceSheet(isOpen: boolean) {
  const { workspace, workspaces, switchWorkspace } = useActiveWorkspace();
  const { clearProject } = useActiveProject();
  const { deleteWorkspace } = useDeleteWorkspace();
  const [view, setView] = useState<WorkspaceSheetView>('list');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Workspace | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setView('list');
      setTargetId(null);
      setSnapshot(null);
    }
  }

  const target = workspaces.find((item) => item.id === targetId) ?? snapshot;

  const remove = async (id: string): Promise<boolean> => {
    const isDeleted = await deleteWorkspace(id);
    if (!isDeleted) return false;

    if (id === workspace.id) {
      clearProject();
      switchWorkspace(DEFAULT_WORKSPACE.id);
    }
    setView('list');
    return true;
  };

  return {
    view,
    workspaces,
    target,
    canDelete: target !== null && target.id !== DEFAULT_WORKSPACE.id,
    activeId: workspace.id,
    activate: (id: string) => {
      if (id !== workspace.id) clearProject();
      switchWorkspace(id);
    },
    remove,
    openActions: (id: string) => {
      setTargetId(id);
      setSnapshot(workspaces.find((item) => item.id === id) ?? null);
      setView('actions');
    },
    showCreate: () => setView('create'),
    showRename: () => setView('rename'),
    showDelete: () => setView('delete'),
    showList: () => setView('list'),
    back: () => setView(view === 'rename' || view === 'delete' ? 'actions' : 'list'),
  };
}