import { baseApi } from '@/shared/api';
import type { DeletedNote, NewNote, Note } from '../model/types/note';
import { notesMock } from './__mocks__/notesMock';

const COLLECTION = 'notes';

export const noteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotes: build.query<Note[], void>({
      query: () => ({ op: 'list', collection: COLLECTION, seed: notesMock }),
      providesTags: ['Note'],
    }),
    createNote: build.mutation<Note, NewNote>({
      query: (body) => ({ op: 'create', collection: COLLECTION, body }),
      invalidatesTags: ['Note'],
    }),
    updateNote: build.mutation<Note, { id: string; patch: Partial<NewNote> }>({
      query: ({ id, patch }) => ({ op: 'update', collection: COLLECTION, id, patch }),
      invalidatesTags: ['Note'],
    }),
    removeNotes: build.mutation<number, readonly string[]>({
      query: (ids) => ({ op: 'removeMany', collection: COLLECTION, ids }),
      invalidatesTags: ['Note'],
    }),
    deleteNote: build.mutation<DeletedNote, string>({
      query: (id) => ({ op: 'remove', collection: COLLECTION, id }),
      invalidatesTags: ['Note'],
    }),
    restoreDeletedNote: build.mutation<Note, DeletedNote>({
      query: ({ record, index }) => ({
        op: 'restore',
        collection: COLLECTION,
        record,
        index,
      }),
      invalidatesTags: ['Note'],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useRemoveNotesMutation,
  useDeleteNoteMutation,
  useRestoreDeletedNoteMutation,
} = noteApi;