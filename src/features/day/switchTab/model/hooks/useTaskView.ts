import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  hideEmptyCategoriesChanged,
  selectHideEmptyCategories,
  selectTaskFilter,
  taskFilterChanged,
} from '../slice/dayTabSlice';
import type { TaskFilter } from '../slice/dayTabSlice';

export function useTaskView() {
  const dispatch = useDispatch();
  const taskFilter = useSelector(selectTaskFilter);
  const hideEmptyCategories = useSelector(selectHideEmptyCategories);

  const setTaskFilter = useCallback(
    (next: TaskFilter) => {
      dispatch(taskFilterChanged(next));
    },
    [dispatch],
  );

  const setHideEmptyCategories = useCallback(
    (next: boolean) => {
      dispatch(hideEmptyCategoriesChanged(next));
    },
    [dispatch],
  );

  return { taskFilter, setTaskFilter, hideEmptyCategories, setHideEmptyCategories };
}