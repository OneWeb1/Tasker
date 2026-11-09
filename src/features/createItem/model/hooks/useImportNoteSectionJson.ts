import { readNoteSection } from '@/entities/note';
import type { Note } from '@/entities/note';
import { resolveWorkspaceId } from '@/entities/workspace';
import { useJsonImport } from '@/shared/lib/hooks/useJsonImport';
import { guardJson } from '@/shared/lib/utils/json';
import type { ParseResult } from '@/shared/lib/utils/json';
import { buildNoteSectionPrompt } from '../lib/buildNoteSectionPrompt';
import { applyNoteSectionUpdate } from '../lib/noteSectionBlock';
import { parseNoteSectionJson } from '../lib/parseNoteSectionJson';
import { useNoteImportContext } from './useNoteImportContext';
import { useSubmitItem } from './useSubmitItem';

const NOT_FOUND = 'Блок не знайдено';

export function useImportNoteSectionJson(note: Note, ordinal: number, onApplied: () => void) {
  const workspaceId = resolveWorkspaceId(note.workspaceId);
  const { projects } = useNoteImportContext(workspaceId);
  const { submitNoteUpdate } = useSubmitItem();
  const section = readNoteSection(note.content, ordinal);

  const importJson = async (raw: string): Promise<ParseResult<unknown>> => {
    if (!section) return { ok: false, error: NOT_FOUND };

    const parsed = parseNoteSectionJson(raw);
    if (!parsed.ok) return parsed;

    const next = guardJson(() => applyNoteSectionUpdate(note.content, section, parsed.value));
    if (!next.ok) return next;

    await submitNoteUpdate(note.id, { content: next.value, updatedAt: Date.now() });
    onApplied();
    return next;

  };

  const importState = useJsonImport(importJson);
  const prompt = section
    ? buildNoteSectionPrompt(
        note,
        section,
        projects.find((item) => item.id === note.projectId)?.title,
      )
    : '';

  return { ...importState, prompt };
}