import { useCallback, useState } from 'react';
import { useItemSelection } from '@/shared/lib/hooks/useItemSelection';

type Edit = { kind: 'renaming'; id: string } | { kind: 'adding'; parentId: string | null };

export function useChecklistItemSelection() {
  const selection = useItemSelection();
  const [edit, setEdit] = useState<Edit | null>(null);
  const { ids, clear } = selection;

  const startRename = useCallback(() => {
    const [id] = ids;
    if (ids.length !== 1 || id === undefined) return;
    clear();
    setEdit({ kind: 'renaming', id });
  }, [clear, ids]);

  const startAdd = useCallback(
    (parentId: string | null) => {
      clear();
      setEdit({ kind: 'adding', parentId });
    },
    [clear],
  );

  const endRename = useCallback(
    () => setEdit((current) => (current?.kind === 'renaming' ? null : current)),
    [],
  );

  const endAdd = useCallback(
    () => setEdit((current) => (current?.kind === 'adding' ? null : current)),
    [],
  );

  return {
    ids,
    selectedIds: selection.selectedIds,
    count: selection.count,
    isActive: selection.isActive,
    isMulti: selection.isMulti,
    pick: selection.pick,
    startMulti: selection.startMulti,
    reset: clear,
    renamingId: edit?.kind === 'renaming' ? edit.id : null,
    adding: edit?.kind === 'adding' ? { parentId: edit.parentId } : null,
    startRename,
    startAdd,
    endRename,
    endAdd,
  };
}