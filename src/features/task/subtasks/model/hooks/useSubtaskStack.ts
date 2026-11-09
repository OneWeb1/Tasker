import { useCallback, useState } from 'react';

interface SubtaskStack {
  ids: string[];
  depth: number;
}

export function useSubtaskStack(initialId?: string) {
  const [stack, setStack] = useState<SubtaskStack>(() =>
    initialId ? { ids: [initialId], depth: 1 } : { ids: [], depth: 0 },
  );

  const open = useCallback((id: string) => {
    setStack((current) => ({
      ids: [...current.ids.slice(0, current.depth), id],
      depth: current.depth + 1,
    }));
  }, []);

  const closeAt = useCallback((index: number) => {
    setStack((current) => (current.depth === index + 1 ? { ...current, depth: index } : current));
  }, []);

  const closeAll = useCallback(() => {
    setStack((current) => (current.depth === 0 ? current : { ...current, depth: 0 }));
  }, []);

  return { ids: stack.ids, depth: stack.depth, open, closeAt, closeAll };
}