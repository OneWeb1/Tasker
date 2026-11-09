import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { DateRange } from '@/shared/lib/utils/date';
import { boundsChanged } from '../slice/selectedDateSlice';

export function useDateBounds(range: DateRange | null): void {
  const dispatch = useDispatch();
  const from = range?.from;
  const to = range?.to;

  useEffect(() => {
    if (from === undefined || to === undefined) return undefined;
    dispatch(boundsChanged({ from, to }));
    return () => {
      dispatch(boundsChanged(null));
    };
  }, [dispatch, from, to]);
}