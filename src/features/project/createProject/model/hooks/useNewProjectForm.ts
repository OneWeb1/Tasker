import { useState } from 'react';
import { NEW_PROJECT_EMOJI, PROJECT_TITLE_MAX_LENGTH } from '@/entities/project';
import type { Project } from '@/entities/project';
import { isDuplicateProjectTitle } from '../lib/isDuplicateProjectTitle';
import { useCreateProject } from './useCreateProject';

type SubmitStatus = 'idle' | 'submitting' | 'error';

export function useNewProjectForm(
  projects: readonly Project[],
  workspaceId: string,
  onCreated: (project: Project) => void,
) {
  const { submitProject } = useCreateProject();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(NEW_PROJECT_EMOJI);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const trimmedTitle = title.trim();
  const isDuplicate = isDuplicateProjectTitle(projects, trimmedTitle);
  const isValid =
    trimmedTitle !== '' && trimmedTitle.length <= PROJECT_TITLE_MAX_LENGTH && !isDuplicate;
  const isSubmitting = status === 'submitting';

  const handleCreate = async () => {
    if (!isValid || isSubmitting) return;

    setStatus('submitting');
    try {
      const created = await submitProject({ title: trimmedTitle, emoji, workspaceId });
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