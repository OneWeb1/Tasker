export interface DotsProgress {
  progress: number;
  isDragging: boolean;
  isSettling: boolean;
}

export interface DotsProgressStore {
  get: () => DotsProgress;
  set: (next: DotsProgress) => void;
  subscribe: (listener: () => void) => () => void;
}

export const REST_DOTS_PROGRESS: DotsProgress = {
  progress: 0,
  isDragging: false,
  isSettling: false,
};

export const createDotsProgressStore = (): DotsProgressStore => {
  let state = REST_DOTS_PROGRESS;
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set: (next) => {
      if (
        next.progress === state.progress &&
        next.isDragging === state.isDragging &&
        next.isSettling === state.isSettling
      ) {
        return;
      }
      state = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const IDLE_DOTS_STORE: DotsProgressStore = createDotsProgressStore();