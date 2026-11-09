import { useCallback, useSyncExternalStore } from 'react';
import type { Category } from '@/entities/category';
import type { Period } from '@/entities/period';
import {
  getCategoryScreen,
  setCategoryScreen,
  subscribeCategoryScreen,
} from '../lib/categoryScreenStore';

interface OpenCategoryScreenParams {
  category: Category;
  period: Period;
  periodLabel: string;
}

export function useCategoryScreen() {
  const screen = useSyncExternalStore(subscribeCategoryScreen, getCategoryScreen);

  const open = useCallback((params: OpenCategoryScreenParams) => {
    setCategoryScreen({ isOpen: true, ...params });
  }, []);

  const close = useCallback(() => {
    setCategoryScreen({ ...getCategoryScreen(), isOpen: false });
  }, []);

  return { screen, open, close };
}