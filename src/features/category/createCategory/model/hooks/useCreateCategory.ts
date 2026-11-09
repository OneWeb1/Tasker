import { useCallback } from 'react';
import { useCreateCategoryMutation } from '@/entities/category';
import type { Category, NewCategory } from '@/entities/category';

export function useCreateCategory() {
  const [createCategory] = useCreateCategoryMutation();

  const submitCategory = useCallback(
    (input: NewCategory): Promise<Category> => createCategory(input).unwrap(),
    [createCategory],
  );

  return { submitCategory };
}