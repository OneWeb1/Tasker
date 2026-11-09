import { DEFAULT_WORKSPACE } from '../../model/constants/workspaces';

export const resolveWorkspaceId = (workspaceId: string | null | undefined): string =>
  workspaceId ?? DEFAULT_WORKSPACE.id;