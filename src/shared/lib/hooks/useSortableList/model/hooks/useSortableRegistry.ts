import { useCallback, useRef } from 'react';

export function useSortableRegistry() {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<string, HTMLElement>());

  const registerItem = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) items.current.set(id, element);
      else items.current.delete(id);
    },
    [],
  );

  return { containerRef, items, registerItem };
}