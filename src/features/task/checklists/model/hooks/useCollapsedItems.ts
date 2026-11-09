import { useCallback, useState } from 'react';

export function useCollapsedItems() {
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expand = useCallback((id: string) => {
    setCollapsedIds((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, []);

  return { collapsedIds, toggle, expand };
}