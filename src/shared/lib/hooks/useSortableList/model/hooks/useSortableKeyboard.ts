import { useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, RefObject } from 'react';
import { moveItem } from '@/shared/lib/utils/moveItem';
import type { SortablePhase } from '../sortableMachine';
import type { SortableAnnouncement } from '../types';

interface UseSortableKeyboardOptions {
  isEnabled: boolean;
  getPhase: () => SortablePhase;
  items: RefObject<Map<string, HTMLElement>>;
  latest: RefObject<{ ids: readonly string[]; onReorder: (orderedIds: string[]) => void }>;
  idsKey: string;
}

export function useSortableKeyboard({
  isEnabled,
  getPhase,
  items,
  latest,
  idsKey,
}: UseSortableKeyboardOptions) {
  const [liftedId, setLiftedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<SortableAnnouncement | null>(null);
  const startOrder = useRef<readonly string[]>([]);
  const pendingFocusId = useRef<string | null>(null);

  useLayoutEffect(() => {
    const focusId = pendingFocusId.current;
    if (!focusId) return;
    pendingFocusId.current = null;
    items.current.get(focusId)?.focus();
  }, [idsKey, items]);

  const announce = (type: SortableAnnouncement['type'], id: string, order: readonly string[]) => {
    setAnnouncement({ type, id, position: order.indexOf(id) + 1, total: order.length });
  };

  const lift = (id: string) => {
    startOrder.current = latest.current.ids;
    setLiftedId(id);
    announce('lift', id, latest.current.ids);
  };

  const drop = (id: string) => {
    setLiftedId(null);
    announce('drop', id, latest.current.ids);
  };

  const cancel = (id: string) => {
    pendingFocusId.current = id;
    setLiftedId(null);
    latest.current.onReorder([...startOrder.current]);
    announce('cancel', id, startOrder.current);
  };

  const move = (id: string, delta: -1 | 1) => {
    const { ids, onReorder } = latest.current;
    const from = ids.indexOf(id);
    const to = from + delta;
    if (from === -1 || to < 0 || to >= ids.length) return;

    const next = moveItem(ids, from, to);
    pendingFocusId.current = id;
    onReorder(next);
    announce('move', id, next);
  };

  const handleKeyDown = (id: string, event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!isEnabled || getPhase() !== 'idle') return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (liftedId === id) drop(id);
      else lift(id);
      return;
    }

    if (liftedId !== id) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      cancel(id);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(id, event.key === 'ArrowUp' ? -1 : 1);
    }
  };

  const handleBlur = (id: string, event: FocusEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (liftedId !== id || pendingFocusId.current === id) return;
    setLiftedId(null);
  };

  const getKeyboardHandlers = (id: string) => ({
    'data-lifted': liftedId === id,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleKeyDown(id, event),
    onBlur: (event: FocusEvent<HTMLElement>) => handleBlur(id, event),
  });

  return { announcement, getKeyboardHandlers };
}