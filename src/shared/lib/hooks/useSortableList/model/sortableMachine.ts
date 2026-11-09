export type SortablePhase = 'idle' | 'dragging' | 'dropping' | 'committing' | 'releasing';

export interface SortableState {
  phase: SortablePhase;
  activeId: string | null;
}

export type SortableEvent =
  | { type: 'START'; id: string }
  | { type: 'DROP' }
  | { type: 'AWAIT_ORDER' }
  | { type: 'SETTLE' }
  | { type: 'RELEASE' }
  | { type: 'RESET' };

export const initialSortableState: SortableState = { phase: 'idle', activeId: null };

export const transitionSortable = (state: SortableState, event: SortableEvent): SortableState => {
  switch (event.type) {
    case 'START':
      return state.phase === 'idle' || state.phase === 'releasing'
        ? { phase: 'dragging', activeId: event.id }
        : state;

    case 'DROP':
      return state.phase === 'dragging' ? { ...state, phase: 'dropping' } : state;

    case 'AWAIT_ORDER':
      return state.phase === 'dropping' ? { ...state, phase: 'committing' } : state;

    case 'SETTLE':
      return state.phase === 'dropping' || state.phase === 'committing'
        ? { ...state, phase: 'releasing' }
        : state;

    case 'RELEASE':
      return state.phase === 'releasing' ? initialSortableState : state;

    case 'RESET':
      return initialSortableState;

  }
};