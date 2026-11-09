import { useCallback, useMemo, useState } from 'react';

interface SelectionState {
  ids: readonly string[];
  isMulti: boolean;
}

const EMPTY_IDS: readonly string[] = [];

export function useItemSelection() {
  const [state, setState] = useState<SelectionState | null>(null);

  const ids = state?.ids ?? EMPTY_IDS;
  const selectedIds = useMemo<ReadonlySet<string>>(() => new Set(ids), [ids]);

  const pick = useCallback(
    (id: string) =>
      setState((current) => {
        if (!current?.isMulti) return { ids: [id], isMulti: false };
        const next = current.ids.includes(id)
          ? current.ids.filter((selectedId) => selectedId !== id)
          : [...current.ids, id];
        return next.length === 0 ? null : { ids: next, isMulti: true };
      }),
    [],
  );

  const startMulti = useCallback(
    () => setState((current) => (current ? { ...current, isMulti: true } : current)),
    [],
  );

  const clear = useCallback(() => setState(null), []);

  return {
    ids,
    selectedIds,
    count: ids.length,
    isActive: state !== null,
    isMulti: state?.isMulti ?? false,
    pick,
    startMulti,
    clear,
  };
}