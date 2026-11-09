import type { Category } from '@/entities/category';
import { useJsonImport } from '@/shared/lib/hooks/useJsonImport';
import type { ParseResult } from '@/shared/lib/utils/json';
import { buildCategoryJsonPrompt } from '../lib/buildCategoryJsonPrompt';
import { parseCategoryJson } from '../lib/parseCategoryJson';
import { useCreateCategory } from './useCreateCategory';

export function useImportCategoryJson(
  categories: readonly Category[],
  workspaceId: string,
  onCreated: (category: Category) => void,
) {
  const { submitCategory } = useCreateCategory();

  const importJson = async (raw: string): Promise<ParseResult<unknown>> => {
    const result = parseCategoryJson(raw, categories);
    if (result.ok) onCreated(await submitCategory({ ...result.value, workspaceId }));
    return result;
  };

  return { ...useJsonImport(importJson), prompt: buildCategoryJsonPrompt(categories) };
}