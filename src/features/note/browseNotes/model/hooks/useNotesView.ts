import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notesViewChanged, selectNotesView } from '../slice/notesViewSlice';
import type { NotesView } from '../slice/notesViewSlice';

export function useNotesView() {
  const dispatch = useDispatch();
  const view = useSelector(selectNotesView);

  const setView = useCallback(
    (next: NotesView) => {
      dispatch(notesViewChanged(next));
    },
    [dispatch],
  );

  return { view, setView };
}