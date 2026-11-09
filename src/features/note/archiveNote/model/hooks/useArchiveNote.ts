import { useCallback } from 'react';
import { useUpdateNoteMutation } from '@/entities/note';

export function useArchiveNote() {
  const [updateNote] = useUpdateNoteMutation();

  const setArchived = useCallback(
    (id: string, isArchived: boolean) => {
      void updateNote({ id, patch: { isArchived } });
    },
    [updateNote],
  );

  return { setArchived };
}