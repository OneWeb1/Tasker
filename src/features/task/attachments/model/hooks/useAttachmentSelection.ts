import { useCallback, useMemo, useState } from 'react';

export function useAttachmentSelection() {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string> | null>(null);

  const start = useCallback((id: string) => setSelectedIds(new Set([id])), []);

  const cancel = useCallback(() => setSelectedIds(null), []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((current) => {
      if (!current) return current;
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSelected = useCallback((id: string) => selectedIds?.has(id) ?? false, [selectedIds]);

  const ids = useMemo(() => (selectedIds ? [...selectedIds] : []), [selectedIds]);

  return { isActive: selectedIds !== null, ids, start, toggle, cancel, isSelected };
}