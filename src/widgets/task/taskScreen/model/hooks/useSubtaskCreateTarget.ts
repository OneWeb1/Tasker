import { useCallback, useState } from 'react';

interface SubtaskCreateTarget {
  parentId?: string;
  isOpen: boolean;
  token: number;
}

export function useSubtaskCreateTarget() {
  const [create, setCreate] = useState<SubtaskCreateTarget | null>(null);

  const openCreate = useCallback((parentId?: string) => {
    setCreate((current) => ({ parentId, isOpen: true, token: (current?.token ?? 0) + 1 }));
  }, []);

  const closeCreate = useCallback(() => {
    setCreate((current) => (current ? { ...current, isOpen: false } : current));
  }, []);

  return { create, openCreate, closeCreate };
}