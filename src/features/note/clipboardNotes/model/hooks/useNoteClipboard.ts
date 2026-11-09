import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  buildNoteCopy,
  buildNoteTimestamp,
  useCreateNoteMutation,
  useGetNotesQuery,
  useRemoveNotesMutation,
  useUpdateNoteMutation,
} from '@/entities/note';
import type { Note } from '@/entities/note';
import { resolveWorkspaceId } from '@/entities/workspace';
import { getNoteClipboard, setNoteClipboard, subscribeNoteClipboard } from '../lib/noteClipboardStore';
import type { NoteClipboardMode } from '../lib/noteClipboardStore';

export interface NotePasteResult {
  mode: NoteClipboardMode;
  count: number;
  undo: () => void;
}

export function useNoteClipboard() {
  const { data: notes } = useGetNotesQuery();
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [removeNotes] = useRemoveNotesMutation();
  const clipboard = useSyncExternalStore(subscribeNoteClipboard, getNoteClipboard);

  const sources = useMemo<Note[]>(() => {
    if (!clipboard) return [];
    const ids = new Set(clipboard.ids);
    return (notes ?? []).filter((note) => ids.has(note.id));
  }, [clipboard, notes]);

  const copyNotes = useCallback((selected: readonly Note[]) => {
    setNoteClipboard({ mode: 'copy', ids: selected.map((note) => note.id) });
  }, []);

  const cutNotes = useCallback((selected: readonly Note[]) => {
    setNoteClipboard({ mode: 'cut', ids: selected.map((note) => note.id) });
  }, []);

  const pasteNotes = useCallback(
    async (workspaceId: string, dateKey?: string): Promise<NotePasteResult | null> => {
      if (!clipboard || sources.length === 0) return null;

      const baseTime = dateKey === undefined ? Date.now() : buildNoteTimestamp(dateKey);
      const isSameWorkspace = (note: Note): boolean =>
        resolveWorkspaceId(note.workspaceId) === workspaceId;

      if (clipboard.mode === 'copy') {
        const created: Note[] = [];
        for (let index = 0; index < sources.length; index += 1) {
          const note = sources[index];
          try {
            created.push(
              await createNote(
                buildNoteCopy(note, {
                  updatedAt: baseTime + index,
                  workspaceId,
                  projectId: isSameWorkspace(note) ? note.projectId : null,
                }),
              ).unwrap(),
            );
          } catch {
            break;
          }
        }
        if (created.length === 0) return null;
        return {
          mode: 'copy',
          count: created.length,
          undo: () => {
            void removeNotes(created.map((note) => note.id));
          },
        };
      }

      const moved: Note[] = [];
      for (let index = 0; index < sources.length; index += 1) {
        const note = sources[index];
        try {
          await updateNote({
            id: note.id,
            patch: {
              updatedAt: baseTime + index,
              workspaceId,
              ...(isSameWorkspace(note) ? {} : { projectId: null }),
            },
          }).unwrap();
          moved.push(note);
        } catch {
          break;
        }
      }
      setNoteClipboard(null);
      if (moved.length === 0) return null;

      return {
        mode: 'cut',
        count: moved.length,
        undo: () => {
          moved.forEach((note) => {
            void updateNote({
              id: note.id,
              patch: {
                updatedAt: note.updatedAt,
                workspaceId: resolveWorkspaceId(note.workspaceId),
                projectId: note.projectId ?? null,
              },
            });
          });
        },
      };
    },
    [clipboard, createNote, removeNotes, sources, updateNote],

  );

  return {
    clipboardCount: sources.length,
    copyNotes,
    cutNotes,
    pasteNotes,
  };
}