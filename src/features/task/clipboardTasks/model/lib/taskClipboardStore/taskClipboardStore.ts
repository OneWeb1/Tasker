import { createExternalStore } from '@/shared/lib/utils/externalStore';

export type TaskClipboardMode = 'copy' | 'cut';

export interface TaskClipboardState {
  mode: TaskClipboardMode;
  ids: readonly string[];
}

const store = createExternalStore<TaskClipboardState | null>(null);

export const getTaskClipboard = store.get;

export const setTaskClipboard = store.set;

export const subscribeTaskClipboard = store.subscribe;