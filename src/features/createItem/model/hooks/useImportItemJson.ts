import { filterCategoriesByWorkspace, useGetCategoriesQuery } from '@/entities/category';
import { buildNoteTimestamp } from '@/entities/note';
import { useJsonImport } from '@/shared/lib/hooks/useJsonImport';
import { getTodayKey } from '@/shared/lib/utils/date';
import type { ParseResult } from '@/shared/lib/utils/json';
import { buildNoteJsonPrompt } from '../lib/buildNoteJsonPrompt';
import { buildTaskJsonPrompt } from '../lib/buildTaskJsonPrompt';
import { parseNoteJson } from '../lib/parseNoteJson';
import { parseTaskJson } from '../lib/parseTaskJson';
import { useCreateItem } from './useCreateItem';
import { useNoteImportContext } from './useNoteImportContext';
import { useSubmitItem } from './useSubmitItem';

export function useImportItemJson(defaultDate: string, defaultWorkspaceId: string) {
  const { kind, categoryId, close } = useCreateItem();
  const { submitTask, submitNote } = useSubmitItem();
    const { data: allCategories = [] } = useGetCategoriesQuery();
  const categories = filterCategoriesByWorkspace(allCategories, defaultWorkspaceId);
  const { projects: workspaceProjects, existingTags } = useNoteImportContext(defaultWorkspaceId);

  const importNote = async (raw: string): Promise<ParseResult<unknown>> => {
    const result = parseNoteJson(raw, {
      updatedAt: buildNoteTimestamp(defaultDate),
      workspaceId: defaultWorkspaceId,
      projects: workspaceProjects,
      existingTags,
    });
    if (result.ok) await submitNote(result.value);
    return result;
  };

  const importTask = async (raw: string): Promise<ParseResult<unknown>> => {
    const today = getTodayKey();
    const result = parseTaskJson(raw, {
      minDate: today,
      fallbackDate: defaultDate > today ? defaultDate : today,
      defaultCategoryId: categoryId,
      categoryIds: categories.map((item) => item.id),
      projectIds: workspaceProjects.map((item) => item.id),
      workspaceId: defaultWorkspaceId,
    });
    if (result.ok) await submitTask(result.value);
    return result;
  };

  const importJson = async (raw: string): Promise<ParseResult<unknown>> => {
    const result = kind === 'note' ? await importNote(raw) : await importTask(raw);
    if (result.ok) close();
    return result;
  };

  const prompt =
    kind === 'note'
      ? buildNoteJsonPrompt({
          existingTags,
          projectTitles: workspaceProjects.map((item) => item.title),
        })
      : buildTaskJsonPrompt({ today: getTodayKey(), categories });

  return { ...useJsonImport(importJson), prompt };
}