import { createExternalStore } from '@/shared/lib/utils/externalStore';

export type CategoryClipboardMode = 'copy' | 'cut';

export interface CategoryClipboardState {
  mode: CategoryClipboardMode;
  ids: readonly string[];
  workspaceId: string;
}

const store = createExternalStore<CategoryClipboardState | null>(null);

export const getCategoryClipboard = store.get;

export const setCategoryClipboard = store.set;

export const subscribeCategoryClipboard = store.subscribe;