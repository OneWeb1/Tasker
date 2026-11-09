export interface ExternalStore<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export const createExternalStore = <T>(initial: T): ExternalStore<T> => {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set: (next) => {
      state = next;
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