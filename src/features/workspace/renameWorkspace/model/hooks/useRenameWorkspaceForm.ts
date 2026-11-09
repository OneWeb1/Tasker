import { useState } from 'react';
import {
  WORKSPACE_TITLE_MAX_LENGTH,
  isDuplicateWorkspaceTitle,
  useUpdateWorkspaceMutation,
} from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';

type SubmitStatus = 'idle' | 'submitting' | 'error';

export function useRenameWorkspaceForm(
  workspace: Workspace,
  workspaces: readonly Workspace[],
  onRenamed: () => void,
) {
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [title, setTitle] = useState(workspace.title);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const trimmedTitle = title.trim();
  const isDuplicate = isDuplicateWorkspaceTitle(
    workspaces.filter((item) => item.id !== workspace.id),
    trimmedTitle,
  );
  const isValid =
    trimmedTitle !== '' &&
    trimmedTitle !== workspace.title &&
    trimmedTitle.length <= WORKSPACE_TITLE_MAX_LENGTH &&
    !isDuplicate;
  const isSubmitting = status === 'submitting';

  const handleRename = async () => {
    if (!isValid || isSubmitting) return;

    setStatus('submitting');
    try {
      await updateWorkspace({ id: workspace.id, patch: { title: trimmedTitle } }).unwrap();
      onRenamed();
    } catch {
      setStatus('error');
    }
  };

  return {
    title,
    setTitle,
    isDuplicate,
    isValid,
    isSubmitting,
    hasError: status === 'error',
    handleRename,
  };
}