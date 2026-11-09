import { useCallback, useState } from 'react';
import { useGetProjectsQuery } from '@/entities/project';
import { useGetTasksQuery } from '@/entities/task';
import { requestNameFocus, useSettings, useUserAvatar } from '@/features/settings/managePreferences';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';

export function useProfileOverview() {
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: projects = [] } = useGetProjectsQuery();

  const [, navigate] = useHashPath();
  const { userName } = useSettings();
  const { changeAvatar } = useUserAvatar();
  const [hasAvatarError, setHasAvatarError] = useState(false);

  const editName = useCallback(() => {
    requestNameFocus();
    navigate(ROUTE_PATHS.settings);
  }, [navigate]);

  const pickAvatar = useCallback(
    (file: File) => {
      void changeAvatar(file).then((isChanged) => setHasAvatarError(!isChanged));
    },
    [changeAvatar],
  );

  const openSettings = useCallback(() => {
    navigate(ROUTE_PATHS.settings);
  }, [navigate]);

  return {
    tasksCount: tasks.length,
    projectsCount: projects.length,
    userName,
    hasAvatarError,
    editName,
    pickAvatar,
    openSettings,
  };
}