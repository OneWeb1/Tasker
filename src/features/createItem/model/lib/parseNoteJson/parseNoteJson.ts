import { addNoteTag, isSameNoteTag } from '@/entities/note';
import type { NewNote, NoteTextAlign } from '@/entities/note';
import type { Project } from '@/entities/project';
import {
  JsonFieldError,
  guardJson,
  parseJsonObject,
  readOptionalBoolean,
  readOptionalString,
  readRequiredString,
} from '@/shared/lib/utils/json';
import type { ParseResult } from '@/shared/lib/utils/json';
import { normalizeNoteContent } from '../normalizeNoteContent';

interface NoteJsonContext {
  updatedAt: number;
  workspaceId: string;
  projects: readonly Pick<Project, 'id' | 'title'>[];
  existingTags: readonly string[];
}

const readTags = (
  source: Record<string, unknown>,
  existingTags: readonly string[],
): ParseResult<string[] | undefined> => {
  const value = source.tags;
  if (value === undefined || value === null) return { ok: true, value: undefined };
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string')) {
    return { ok: false, error: 'Поле "tags" має бути масивом рядків' };
  }
  const canonical = value.map((tag) => existingTags.find((item) => isSameNoteTag(item, tag)) ?? tag);
  return { ok: true, value: canonical.reduce<string[]>(addNoteTag, []) };
};

const readTextAlign = (source: Record<string, unknown>): NoteTextAlign | undefined => {
  const value = readOptionalString(source, 'textAlign')?.trim().toLowerCase();
  if (!value || value === 'left') return undefined;
  if (value === 'center' || value === 'right') return value;
  throw new JsonFieldError('Поле "textAlign" має бути "left", "center" або "right"');
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const readColor = (source: Record<string, unknown>): string | undefined => {
  const value = readOptionalString(source, 'color')?.trim();
  if (!value) return undefined;
  if (!HEX_COLOR.test(value)) {
    throw new JsonFieldError('Поле "color" має бути у форматі #RRGGBB');
  }
  return value.toLowerCase();
};

const readProjectId = (
  source: Record<string, unknown>,
  projects: NoteJsonContext['projects'],
): string | undefined => {
  const title = readOptionalString(source, 'project')?.trim();
  if (!title) return undefined;
  const project = projects.find((item) => isSameNoteTag(item.title, title));
  if (!project) throw new JsonFieldError(`Проєкт «${title}» не знайдено серед наявних`);
  return project.id;
};

export const parseNoteJson = (
  raw: string,
  { updatedAt, workspaceId, projects, existingTags }: NoteJsonContext,
): ParseResult<NewNote> => {
  const parsed = parseJsonObject(raw);
  if (!parsed.ok) return parsed;

  const tags = readTags(parsed.value, existingTags);
  if (!tags.ok) return tags;

  return guardJson(() => {
    const textAlign = readTextAlign(parsed.value);
    const projectId = readProjectId(parsed.value, projects);
    const color = readColor(parsed.value);
    const isPinned = readOptionalBoolean(parsed.value, 'isPinned');
    const isArchived = readOptionalBoolean(parsed.value, 'isArchived');
    return {
      title: readRequiredString(parsed.value, 'title'),
      content: normalizeNoteContent(readOptionalString(parsed.value, 'content') ?? '').trim(),
      updatedAt,
      workspaceId,
      ...(tags.value ? { tags: tags.value } : {}),
      ...(textAlign ? { textAlign } : {}),
      ...(projectId ? { projectId } : {}),
      ...(color ? { color } : {}),
      ...(isPinned === undefined ? {} : { isPinned }),
      ...(isArchived === undefined ? {} : { isArchived }),
    };
  });
};