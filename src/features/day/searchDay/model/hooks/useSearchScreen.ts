import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchPriorityChanged,
  searchScopeChanged,
  searchScreenClosed,
  searchScreenOpened,
  searchStatusChanged,
  searchTermChanged,
  selectSearchScreen,
} from '../slice/daySearchSlice';
import type {
  SearchPriorityFilter,
  SearchScope,
  SearchStatusFilter,
} from '../types/searchScreen';

export function useSearchScreen() {
  const dispatch = useDispatch();
  const { isOpen, term, scope, status, priority } = useSelector(selectSearchScreen);

  const open = useCallback(() => {
    dispatch(searchScreenOpened());
  }, [dispatch]);

  const close = useCallback(() => {
    dispatch(searchScreenClosed());
  }, [dispatch]);

  const setTerm = useCallback(
    (next: string) => {
      dispatch(searchTermChanged(next));
    },
    [dispatch],
  );

  const setScope = useCallback(
    (next: SearchScope) => {
      dispatch(searchScopeChanged(next));
    },
    [dispatch],
  );

  const setStatus = useCallback(
    (next: SearchStatusFilter) => {
      dispatch(searchStatusChanged(next));
    },
    [dispatch],
  );

  const setPriority = useCallback(
    (next: SearchPriorityFilter) => {
      dispatch(searchPriorityChanged(next));
    },
    [dispatch],
  );

  return {
    isOpen,
    term,
    scope,
    status,
    priority,
    open,
    close,
    setTerm,
    setScope,
    setStatus,
    setPriority,
  };
}