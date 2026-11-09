import { useRef, useSyncExternalStore } from 'react';

export interface TabShift<T extends string> {
  to: T;
  amount: number;
  isSettling: boolean;
}

export interface TabShiftStore<T extends string> {
  get: () => TabShift<T> | undefined;
  set: (shift: TabShift<T> | undefined) => void;
  subscribe: (listener: () => void) => () => void;
}

const createTabShiftStore = <T extends string>(): TabShiftStore<T> => {
  let current: TabShift<T> | undefined;
  const listeners = new Set<() => void>();

  return {
    get: () => current,
    set: (next) => {
      current = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

const EMPTY_STORE: TabShiftStore<never> = {
  get: () => undefined,
  set: () => {},
  subscribe: () => () => {},
};

export function useTabShiftStore<T extends string>(): TabShiftStore<T> {
  const ref = useRef<TabShiftStore<T> | null>(null);
  if (ref.current === null) ref.current = createTabShiftStore<T>();
  return ref.current;
}

export function useTabShift<T extends string>(
  store?: TabShiftStore<T>,
): TabShift<T> | undefined {
  const target = (store ?? EMPTY_STORE) as TabShiftStore<T>;
  return useSyncExternalStore(target.subscribe, target.get);
}