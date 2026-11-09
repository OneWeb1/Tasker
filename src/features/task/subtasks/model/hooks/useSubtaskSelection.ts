import { useCallback, useEffect, useMemo } from 'react';
import type { TaskSubtask } from '@/entities/task';
import { useItemSelection } from '@/shared/lib/hooks/useItemSelection';
import type { SubtaskBulkActions, SubtaskSelection } from '../types/subtask';

export function useSubtaskSelection(
  items: readonly TaskSubtask[],
  actions?: SubtaskBulkActions,
) {
  const { selectedIds, isActive, isMulti, pick, startMulti, clear } = useItemSelection();

  const selected = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );
  const isAllDone = selected.length > 0 && selected.every((item) => item.done);

  useEffect(() => {
    if (isActive && selected.length === 0) clear();
  }, [clear, isActive, selected.length]);

  const onTap = useCallback(
    (id: string) => {
      if (isMulti) pick(id);
      else clear();
    },
    [clear, isMulti, pick],
  );

  const run = useCallback(
    (action: (ids: readonly string[]) => void) => {
      action(selected.map((item) => item.id));
      clear();
    },
    [clear, selected],
  );

  if (!actions) return { selection: undefined, bar: null, reset: clear };

  const selection: SubtaskSelection = { selectedIds, isActive, onLongPress: pick, onTap };

  const bar = isActive
    ? {
        count: selected.length,
        isMulti,
        isAllDone,
        onToggleDone: () => run((ids) => actions.onToggleDone(ids, !isAllDone)),
        onDuplicate: () => run(actions.onDuplicate),
        onSelect: startMulti,
        onDelete: () => run(actions.onDelete),
        onCancel: clear,
      }
    : null;

  return { selection, bar, reset: clear };
}