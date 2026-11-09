import { useCallback, useRef, useState } from 'react';
import { initialSortableState, transitionSortable } from '../sortableMachine';
import type { SortableEvent, SortablePhase, SortableState } from '../sortableMachine';

export function useSortableMachine() {
  const [state, setState] = useState<SortableState>(initialSortableState);
  const stateRef = useRef<SortableState>(state);

  const send = useCallback((event: SortableEvent) => {
    const next = transitionSortable(stateRef.current, event);
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
  }, []);

  const getPhase = useCallback((): SortablePhase => stateRef.current.phase, []);

  return { activeId: state.activeId, send, getPhase };
}