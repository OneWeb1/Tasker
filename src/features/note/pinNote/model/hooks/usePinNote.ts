import { useCallback } from 'react';
import { useUpdateNoteMutation } from '@/entities/note';

export function usePinNote() {
  const [updateNote] = useUpdateNoteMutation();

  const setPinned = useCallback(
    (id: string, isPinned: boolean) => {
      void updateNote({ id, patch: { isPinned } });
    },
    [updateNote],
  );

  return { setPinned };
}