import { useCallback, useMemo, useState } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import { buildNoteSearchEntries, getNoteSearchFields, useGetNotesQuery } from '@/entities/note';
import type { NoteSearchEntry } from '@/entities/note';
import { useGetProjectsQuery } from '@/entities/project';
import { buildTaskSearchEntries, useGetTasksQuery } from '@/entities/task';
import type { TaskSearchEntry } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import {
  filterSearchEntries,
  groupSearchResults,
  matchesQuery,
  useSearchScreen,
} from '@/features/day/searchDay';
import { useSelectedDate } from '@/features/day/selectDate';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { ROUTE_PATHS, buildTaskPath, resolveRoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';

export function useDaySearchScreen() {
  const search = useSearchScreen();
  const { term, status, priority } = search;
  const [openedNoteId, setOpenedNoteId] = useState<string | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const { data: tasks } = useGetTasksQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: notes } = useGetNotesQuery();
  const { workspace } = useActiveWorkspace();
  const { selectedDate } = useSelectedDate();
  const [path, navigate] = useHashPath();
  const route = resolveRoutePath(path);
  const isScrollLocked = route === ROUTE_PATHS.today;
  const isNotesOnly = route === ROUTE_PATHS.notes;
  const scope = isNotesOnly ? 'notes' : search.scope;

  const entries = useMemo(
    () => buildTaskSearchEntries(filterByWorkspace(tasks ?? [], workspace.id), selectedDate),
    [tasks, workspace.id, selectedDate],
  );

  const results = useMemo(() => {
    const projectTitles = new Map((projects ?? []).map((project) => [project.id, project.title] as const));
    const categoryTitles = new Map(
      (categories ?? []).map((category) => [category.id, category.title] as const),
    );

    return filterSearchEntries(entries, { term, scope, status, priority }).map((entry) => ({
      entry,
      context:
        entry.kind === 'subtask'
          ? entry.parentTitle
          : ((entry.projectId ? projectTitles.get(entry.projectId) : undefined) ??
            categoryTitles.get(entry.categoryId) ??
            null),
    }));
  }, [categories, entries, priority, projects, scope, status, term]);

  const noteResults = useMemo(() => {
    const isVisible =
      scope === 'notes' || (scope === 'all' && status === 'all' && priority === 'all');
    if (!isVisible) return [];

    const scopedNotes = filterByWorkspace(notes ?? [], workspace.id);
    const fieldsById = new Map(
      scopedNotes.map((note) => [note.id, getNoteSearchFields(note)] as const),
    );

    return buildNoteSearchEntries(scopedNotes)
      .filter((entry) => matchesQuery(term, ...(fieldsById.get(entry.id) ?? [])))
      .map((entry) => ({ entry }));
  }, [notes, priority, scope, status, term, workspace.id]);

  const sections = useMemo(
    () => groupSearchResults([...results, ...noteResults], scope === 'all'),
    [noteResults, results, scope],
  );

  const openResult = useCallback(
    (entry: TaskSearchEntry) => {
      navigate(buildTaskPath(entry.rootId));
    },
    [navigate],
  );

  const openNote = useCallback((entry: NoteSearchEntry) => {
    setOpenedNoteId(entry.id);
    setIsNoteOpen(true);
  }, []);

  const closeNote = useCallback(() => setIsNoteOpen(false), []);

  const openedNote = useMemo(
    () => (notes ?? []).find((note) => note.id === openedNoteId) ?? null,
    [notes, openedNoteId],
  );

  return {
    ...search,
    scope,
    isNotesOnly,
    workspaceTitle: workspace.title,
    isScrollLocked,
    sections,
    isEmpty: tasks !== undefined && sections.length === 0,
    openResult,
    openNote,
    openedNote,
    isNoteOpen,
    closeNote,
  };
}