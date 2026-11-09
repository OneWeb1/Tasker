import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { noteSortOrderChanged, selectNoteSortOrder } from '../slice/noteSortSlice';
import type { NoteSortOrder } from '../slice/noteSortSlice';

export function useNoteSort() {
  const dispatch = useDispatch();
  const order = useSelector(selectNoteSortOrder);

  const setOrder = useCallback(
    (next: NoteSortOrder) => {
      dispatch(noteSortOrderChanged(next));
    },
    [dispatch],
  );

  return { order, setOrder };
}