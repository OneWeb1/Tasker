import { baseApi } from '@/shared/api';
import type { DeletedWorkspace, NewWorkspace, Workspace } from '../model/types/workspace';
import { workspacesMock } from './__mocks__/workspacesMock';

const COLLECTION = 'workspaces';

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWorkspaces: build.query<Workspace[], void>({
      query: () => ({ op: 'list', collection: COLLECTION, seed: workspacesMock }),
      providesTags: ['Workspace'],
    }),
    createWorkspace: build.mutation<Workspace, NewWorkspace>({
      query: (body) => ({ op: 'create', collection: COLLECTION, body }),
      invalidatesTags: ['Workspace'],
    }),
    updateWorkspace: build.mutation<Workspace, { id: string; patch: Partial<NewWorkspace> }>({
      query: ({ id, patch }) => ({ op: 'update', collection: COLLECTION, id, patch }),
      invalidatesTags: ['Workspace'],
    }),
    deleteWorkspace: build.mutation<DeletedWorkspace, string>({
      query: (id) => ({ op: 'remove', collection: COLLECTION, id }),
      invalidatesTags: ['Workspace'],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} = workspaceApi;