import { baseApi } from '@/shared/api';
import type { DeletedProject, NewProject, Project } from '../model/types/project';
import { projectsMock } from './__mocks__/projectsMock';

const COLLECTION = 'projects';

export const projectApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => ({ op: 'list', collection: COLLECTION, seed: projectsMock }),
      providesTags: ['Project'],
    }),
    createProject: build.mutation<Project, NewProject>({
      query: (body) => ({ op: 'create', collection: COLLECTION, body }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: build.mutation<DeletedProject, string>({
      query: (id) => ({ op: 'remove', collection: COLLECTION, id }),
      invalidatesTags: ['Project'],
    }),
    restoreDeletedProject: build.mutation<Project, DeletedProject>({
      query: ({ record, index }) => ({
        op: 'restore',
        collection: COLLECTION,
        record,
        index,
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useRestoreDeletedProjectMutation,
} = projectApi;