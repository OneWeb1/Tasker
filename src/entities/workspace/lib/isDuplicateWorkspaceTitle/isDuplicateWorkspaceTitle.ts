import type { Workspace } from '../../model/types/workspace';

export const isDuplicateWorkspaceTitle = (
  workspaces: readonly Workspace[],
  title: string,
): boolean => {
  const normalized = title.trim().toLowerCase();
  return workspaces.some((workspace) => workspace.title.trim().toLowerCase() === normalized);
};