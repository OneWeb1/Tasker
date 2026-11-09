import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  projectCleared,
  projectSelected,
  selectActiveProjectId,
} from '../slice/activeProjectSlice';

export function useActiveProject() {
  const dispatch = useDispatch();
  const activeProjectId = useSelector(selectActiveProjectId);

  const selectProject = useCallback(
    (id: string) => {
      dispatch(projectSelected(id));
    },
    [dispatch],
  );

  const clearProject = useCallback(() => {
    dispatch(projectCleared());
  }, [dispatch]);

  return { activeProjectId, selectProject, clearProject };
}