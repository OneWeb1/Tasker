import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchQueryChanged, selectSearchQuery } from '../slice/daySearchSlice';

export function useDaySearch() {
  const dispatch = useDispatch();
  const query = useSelector(selectSearchQuery);

  const setQuery = useCallback(
    (next: string) => {
      dispatch(searchQueryChanged(next));
    },
    [dispatch],
  );

  const clearQuery = useCallback(() => {
    dispatch(searchQueryChanged(''));
  }, [dispatch]);

  return { query, setQuery, clearQuery };
}