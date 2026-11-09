import { useState } from 'react';
import {
  NEW_WORKSPACE_EMOJI,
  WORKSPACE_TITLE_MAX_LENGTH,
  isDuplicateWorkspaceTitle,
} from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';
import { useCreateWorkspace } from './useCreateWorkspace';

type SubmitStatus = 'idle' | 'submitting' | 'error';

export function useNewWorkspaceForm(
  workspaces: readonly Workspace[],
  onCreated: (workspace: Workspace) => void,
) {
  const { submitWorkspace } = useCreateWorkspace();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(NEW_WORKSPACE_EMOJI);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const trimmedTitle = title.trim();
  const isDuplicate = isDuplicateWorkspaceTitle(workspaces, trimmedTitle);
  const isValid =
    trimmedTitle !== '' && trimmedTitle.length <= WORKSPACE_TITLE_MAX_LENGTH && !isDuplicate;
  const isSubmitting = status === 'submitting';

  const handleCreate = async () => {
    if (!isValid || isSubmitting) return;

    setStatus('submitting');
    try {
      const created = await submitWorkspace({ title: trimmedTitle, emoji });
      onCreated(created);
    } catch {
      setStatus('error');
    }

  };

  return {
    title,
    setTitle,
    emoji,
    setEmoji,
    isDuplicate,
    isValid,
    isSubmitting,
    hasError: status === 'error',
    handleCreate,
  };
}