import { useCallback } from 'react';
import { useCreateWorkspaceMutation } from '@/entities/workspace';
import type { NewWorkspace, Workspace } from '@/entities/workspace';

export function useCreateWorkspace() {
  const [createWorkspace] = useCreateWorkspaceMutation();

  const submitWorkspace = useCallback(
    (input: NewWorkspace): Promise<Workspace> => createWorkspace(input).unwrap(),
    [createWorkspace],
  );

  return { submitWorkspace };
}