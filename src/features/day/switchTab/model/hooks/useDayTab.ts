import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dayTabChanged, selectDayTab } from '../slice/dayTabSlice';
import type { DayTab } from '../slice/dayTabSlice';

export function useDayTab() {
  const dispatch = useDispatch();
  const tab = useSelector(selectDayTab);

  const setTab = useCallback(
    (next: DayTab) => {
      dispatch(dayTabChanged(next));
    },
    [dispatch],
  );

  return { tab, setTab };
}