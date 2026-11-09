import { useCallback } from 'react';
import { useCreateProjectMutation } from '@/entities/project';
import type { NewProject, Project } from '@/entities/project';

export function useCreateProject() {
  const [createProject] = useCreateProjectMutation();

  const submitProject = useCallback(
    (input: NewProject): Promise<Project> => createProject(input).unwrap(),
    [createProject],
  );

  return { submitProject };
}