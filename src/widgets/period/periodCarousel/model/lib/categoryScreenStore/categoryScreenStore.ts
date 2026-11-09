import type { Category } from '@/entities/category';
import type { Period } from '@/entities/period';
import { createExternalStore } from '@/shared/lib/utils/externalStore';

export interface CategoryScreenState {
  isOpen: boolean;
  category: Category | null;
  period: Period | null;
  periodLabel: string;
}

const store = createExternalStore<CategoryScreenState>({
  isOpen: false,
  category: null,
  period: null,
  periodLabel: '',
});

export const getCategoryScreen = store.get;

export const setCategoryScreen = store.set;

export const subscribeCategoryScreen = store.subscribe;