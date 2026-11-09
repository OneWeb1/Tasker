import { useCallback, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { moveItem } from '@/shared/lib/utils/moveItem';
import { COMMIT_FALLBACK_MS } from '../constants';
import type { Scheduler } from '../scheduler';
import type { SortableEvent } from '../sortableMachine';

interface UseSortableLifecycleOptions {
  send: (event: SortableEvent) => void;
  reset: () => void;
  scheduler: Scheduler;
  latest: RefObject<{ ids: readonly string[]; onReorder: (orderedIds: string[]) => void }>;
  idsKey: string;
}

export function useSortableLifecycle({
  send,
  reset,
  scheduler,
  latest,
  idsKey,
}: UseSortableLifecycleOptions) {
  const awaitingOrder = useRef(false);
  const releaseFrame = useRef(0);
  const fallbackTimer = useRef(0);

  const cancelRelease = useCallback(() => {
    scheduler.cancelFrame(releaseFrame.current);
  }, [scheduler]);

  const release = useCallback(() => {
    scheduler.cancelFrame(releaseFrame.current);
    releaseFrame.current = scheduler.requestFrame(() => {
      releaseFrame.current = scheduler.requestFrame(() => send({ type: 'RELEASE' }));
    });
  }, [scheduler, send]);

  const settle = useCallback(() => {
    scheduler.clearTimer(fallbackTimer.current);
    awaitingOrder.current = false;
    reset();
    send({ type: 'SETTLE' });
    release();
  }, [release, reset, scheduler, send]);

  const commit = useCallback(
    (fromIndex: number, finalIndex: number) => {
      if (finalIndex === fromIndex) {
        settle();
        return;
      }

      const { ids, onReorder } = latest.current;
      awaitingOrder.current = true;
      send({ type: 'AWAIT_ORDER' });
      fallbackTimer.current = scheduler.setTimer(settle, COMMIT_FALLBACK_MS);
      onReorder(moveItem(ids, fromIndex, finalIndex));
    },
    [latest, scheduler, send, settle],
  );

  const teardown = useCallback(() => {
    scheduler.cancelFrame(releaseFrame.current);
    scheduler.clearTimer(fallbackTimer.current);
    awaitingOrder.current = false;
    reset();
    send({ type: 'RESET' });
  }, [reset, scheduler, send]);

  useLayoutEffect(() => {
    if (awaitingOrder.current) settle();
  }, [idsKey, settle]);

  return { commit, cancelRelease, teardown };
}