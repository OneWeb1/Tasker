import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notesTagChanged, selectNotesTag } from '../slice/notesViewSlice';

export function useNotesTag() {
  const dispatch = useDispatch();
  const tag = useSelector(selectNotesTag);

  const setTag = useCallback(
    (next: string | null) => {
      dispatch(notesTagChanged(next));
    },
    [dispatch],
  );

  return { tag, setTag };
}