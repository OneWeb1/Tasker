import { resolveWorkspaceId } from '../resolveWorkspaceId';

export const filterByWorkspace = <T extends { workspaceId?: string | null }>(
  items: readonly T[],
  workspaceId: string,
): T[] => items.filter((item) => resolveWorkspaceId(item.workspaceId) === workspaceId);