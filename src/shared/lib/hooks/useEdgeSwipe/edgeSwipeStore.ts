const COMMIT_WINDOW_MS = 500;

let committedAt = Number.NEGATIVE_INFINITY;

export const setEdgeSwipeActive = (value: boolean): void => {
  const root = document.documentElement;
  if (value) root.dataset.edgeSwiping = 'true';
  else delete root.dataset.edgeSwiping;
};

export const markEdgeSwipeCommitted = (): void => {
  committedAt = performance.now();
};

export const consumeEdgeSwipeCommit = (): boolean => {
  const isFresh = performance.now() - committedAt < COMMIT_WINDOW_MS;
  committedAt = Number.NEGATIVE_INFINITY;
  return isFresh;
};