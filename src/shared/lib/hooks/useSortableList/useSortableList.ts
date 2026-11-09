import { useEffect } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useLatest } from '@/shared/lib/hooks/useLatest';
import { HANDLE_STYLE } from './model/constants';
import { useSortableKeyboard } from './model/hooks/useSortableKeyboard';
import { useSortableLayout } from './model/hooks/useSortableLayout';
import { useSortableLifecycle } from './model/hooks/useSortableLifecycle';
import { useSortableMachine } from './model/hooks/useSortableMachine';
import { useSortablePointer } from './model/hooks/useSortablePointer';
import { useSortableRegistry } from './model/hooks/useSortableRegistry';
import { browserScheduler } from './model/scheduler';
import type { Scheduler } from './model/scheduler';

interface UseSortableListOptions {
  ids: readonly string[];
  onReorder: (orderedIds: string[]) => void;
  isEnabled?: boolean;
  scheduler?: Scheduler;
}

export function useSortableList({
  ids,
  onReorder,
  isEnabled = true,
  scheduler = browserScheduler,
}: UseSortableListOptions) {
  const latest = useLatest({ ids, onReorder });
  const idsKey = ids.join('|');

  const { containerRef, items, registerItem } = useSortableRegistry();
  const { activeId, send, getPhase } = useSortableMachine();
  const layout = useSortableLayout({ containerRef, items, latest });
  const lifecycle = useSortableLifecycle({
    send,
    reset: layout.reset,
    scheduler,
    latest,
    idsKey,
  });
  const pointer = useSortablePointer({
    isEnabled,
    scheduler,
    send,
    getPhase,
    items,
    containerRef,
    latest,
    layout,
    commit: lifecycle.commit,
    cancelRelease: lifecycle.cancelRelease,
  });
  const keyboard = useSortableKeyboard({ isEnabled, getPhase, items, latest, idsKey });

  const { abort } = pointer;
  const { teardown } = lifecycle;

  useEffect(
    () => () => {
      abort();
      teardown();
    },
    [abort, teardown],
  );

  useEffect(() => {
    if (isEnabled) return;
    abort();
    teardown();
  }, [isEnabled, abort, teardown]);

  const getHandleProps = (id: string) => ({
    style: HANDLE_STYLE,
    tabIndex: 0,
    ...pointer.getPointerHandlers(id),
    ...keyboard.getKeyboardHandlers(id),
  });

  return {
    containerRef,
    activeId,
    isDragging: activeId !== null,
    announcement: keyboard.announcement,
    registerItem,
    getHandleProps,
  };
}

export type SortableHandleProps = ReturnType<ReturnType<typeof useSortableList>['getHandleProps']>;
export type SortableKeyDown = (event: KeyboardEvent<HTMLElement>) => void;
export type SortablePointerDown = (event: PointerEvent<HTMLElement>) => void;