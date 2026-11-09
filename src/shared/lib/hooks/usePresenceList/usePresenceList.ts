import { useEffect, useRef, useState } from 'react';

export interface PresenceEntry<T> {
  key: string;
  item: T;
  isLeaving: boolean;
  isInitial: boolean;
}

interface LeavingEntry<T> {
  item: T;
  index: number;
}

interface PresenceState<T> {
  source: readonly T[];
  leaving: ReadonlyMap<string, LeavingEntry<T>>;
  initial: ReadonlySet<string>;
}

export function usePresenceList<T>(
  items: readonly T[],
  getKey: (item: T) => string,
  exitMs: number,
): PresenceEntry<T>[] {
  const [state, setState] = useState<PresenceState<T>>(() => ({
    source: items,
    leaving: new Map(),
    initial: new Set(items.map(getKey)),
  }));
  const timers = useRef(new Map<string, number>());

  let current = state;
  if (state.source !== items) {
    const nextKeys = new Set(items.map(getKey));
    const leaving = new Map(state.leaving);
    const initial = new Set(state.initial);

    nextKeys.forEach((key) => leaving.delete(key));
    state.source.forEach((item, index) => {
      const key = getKey(item);
      if (nextKeys.has(key) || leaving.has(key)) return;
      leaving.set(key, { item, index });
      initial.delete(key);
    });

    current = { source: items, leaving, initial };
    setState(current);

  }

  useEffect(() => {
    const active = state.leaving;

    timers.current.forEach((timer, key) => {
      if (active.has(key)) return;
      window.clearTimeout(timer);
      timers.current.delete(key);
    });

    active.forEach((_, key) => {
      if (timers.current.has(key)) return;
      const timer = window.setTimeout(() => {
        timers.current.delete(key);
        setState((previous) => {
          if (!previous.leaving.has(key)) return previous;
          const leaving = new Map(previous.leaving);
          leaving.delete(key);
          return { ...previous, leaving };
        });
      }, exitMs);
      timers.current.set(key, timer);
    });
  }, [state.leaving, exitMs]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const entries: PresenceEntry<T>[] = items.map((item) => {
    const key = getKey(item);
    return { key, item, isLeaving: false, isInitial: current.initial.has(key) };
  });

  [...current.leaving.entries()]
    .sort(([, a], [, b]) => a.index - b.index)
    .forEach(([key, { item, index }]) => {
      entries.splice(Math.min(index, entries.length), 0, {
        key,
        item,
        isLeaving: true,
        isInitial: false,
      });
    });

  return entries;
}