import type { NewNote, Note } from '@/entities/note';
import { resolveWorkspaceId } from '@/entities/workspace';
import { useJsonImport } from '@/shared/lib/hooks/useJsonImport';
import type { ParseResult } from '@/shared/lib/utils/json';
import { buildNoteContextPrompt } from '../lib/buildNoteContextPrompt';
import { parseNoteJson } from '../lib/parseNoteJson';
import { useNoteImportContext } from './useNoteImportContext';
import { useSubmitItem } from './useSubmitItem';

const toPatch = (value: NewNote): Partial<NewNote> => ({
  title: value.title,
  content: value.content,
  textAlign: value.textAlign,
  projectId: value.projectId ?? null,
  color: value.color,
  updatedAt: value.updatedAt,
  ...(value.tags ? { tags: value.tags } : {}),
  ...(value.isPinned === undefined ? {} : { isPinned: value.isPinned }),
  ...(value.isArchived === undefined ? {} : { isArchived: value.isArchived }),
});

export function useImportNoteUpdateJson(note: Note, onApplied: () => void, selection?: string) {
  const workspaceId = resolveWorkspaceId(note.workspaceId);
  const { projects, existingTags } = useNoteImportContext(workspaceId);
  const { submitNoteUpdate } = useSubmitItem();

  const importJson = async (raw: string): Promise<ParseResult<unknown>> => {
    const result = parseNoteJson(raw, {
      updatedAt: Date.now(),
      workspaceId,
      projects,
      existingTags,
    });
    if (result.ok) {
      await submitNoteUpdate(note.id, toPatch(result.value));
      onApplied();
    }
    return result;
  };

  const importState = useJsonImport(importJson);
  const prompt = buildNoteContextPrompt(note, {
    existingTags,
    projectTitles: projects.map((item) => item.title),
    projectTitle: projects.find((item) => item.id === note.projectId)?.title,
    selection,
  });

  return { ...importState, prompt };
}