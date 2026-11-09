import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCreateItem, openCreateItem, selectCreateItem } from '../slice/createItemSlice';
import type { OpenCreateItemPayload } from '../slice/createItemSlice';

export function useCreateItem() {
  const dispatch = useDispatch();
  const { isOpen, kind, categoryId, task, note } = useSelector(selectCreateItem);

  const open = useCallback(
    (payload?: OpenCreateItemPayload) => {
      dispatch(openCreateItem(payload));
    },
    [dispatch],
  );

  const close = useCallback(() => {
    dispatch(closeCreateItem());
  }, [dispatch]);

  return { isOpen, kind, categoryId, task, note, open, close };
}