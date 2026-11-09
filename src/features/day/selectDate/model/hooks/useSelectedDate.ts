import { useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDaysToKey } from '@/shared/lib/utils/date';
import { DateOverrideContext } from '../context/dateOverrideContext';
import { dateSelected, selectDateBounds, selectSelectedDate } from '../slice/selectedDateSlice';

export function useSelectedDate() {
  const dispatch = useDispatch();
  const storedDate = useSelector(selectSelectedDate);
  const override = useContext(DateOverrideContext);
  const selectedDate = override ?? storedDate;
  const bounds = useSelector(selectDateBounds);

  const selectDate = useCallback(
    (dateKey: string) => {
      dispatch(dateSelected(dateKey));
    },
    [dispatch],
  );

  const shiftWeek = useCallback(
    (direction: 1 | -1) => {
      dispatch(dateSelected(addDaysToKey(selectedDate, direction * 7)));
    },
    [dispatch, selectedDate],
  );

  return { selectedDate, bounds, selectDate, shiftWeek };
}