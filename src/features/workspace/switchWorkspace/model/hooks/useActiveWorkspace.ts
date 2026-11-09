import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT_WORKSPACE, useGetWorkspacesQuery } from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';
import { selectActiveWorkspaceId, workspaceActivated } from '../slice/activeWorkspaceSlice';

const FALLBACK_WORKSPACES: readonly Workspace[] = [DEFAULT_WORKSPACE];

export function useActiveWorkspace() {
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveWorkspaceId);
  const { data } = useGetWorkspacesQuery();

  const workspaces = data ?? FALLBACK_WORKSPACES;
  const workspace =
    workspaces.find((item) => item.id === activeId) ?? workspaces[0] ?? DEFAULT_WORKSPACE;

  const switchWorkspace = useCallback(
    (id: string) => {
      dispatch(workspaceActivated(id));
    },
    [dispatch],
  );

  return { workspace, workspaces, switchWorkspace };
}