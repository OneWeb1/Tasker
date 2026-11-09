import { baseApi } from '@/shared/api';
import { afterPaint } from '@/shared/lib/utils/afterPaint';
import { appendFieldChanges } from '../lib/taskChangeLog';
import { stampNewTask } from '../lib/taskHistory';
import type { DeletedTask, NewTask, Task } from '../model/types/task';
import { tasksMock } from './__mocks__/tasksMock';

const COLLECTION = 'tasks';

export const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<Task[], void>({
      query: () => ({ op: 'list', collection: COLLECTION, seed: tasksMock }),
      providesTags: ['Task'],
    }),
    createTask: build.mutation<Task, NewTask>({
      query: (body) => ({
        op: 'create',
        collection: COLLECTION,
        body: stampNewTask(body, Date.now()),
      }),
      invalidatesTags: ['Task'],
    }),
    createTasks: build.mutation<Task[], NewTask[]>({
      query: (bodies) => {
        const now = Date.now();
        return {
          op: 'createMany',
          collection: COLLECTION,
          bodies: bodies.map((body) => stampNewTask(body, now)),
        };
      },
      invalidatesTags: ['Task'],
    }),
    updateTask: build.mutation<Task, { id: string; patch: Partial<NewTask> }>({
      queryFn: async ({ id, patch }, _api, _extra, baseQuery) => {
        await afterPaint();
        const result = await baseQuery({
          op: 'update',
          collection: COLLECTION,
          id,
          patch: (current) => ({
            ...patch,
            ...appendFieldChanges(current as Task, patch, Date.now()),
          }),
        });

        return result.error ? { error: result.error } : { data: result.data as Task };
      },
      async onQueryStarted({ id, patch }, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const target = draft.find((item) => item.id === id);
            if (target) Object.assign(target, patch);
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
              const target = draft.find((item) => item.id === id);
              if (target && data.changeLog) target.changeLog = data.changeLog;
            }),
          );
        } catch {
          optimistic.undo();
        }
      },
    }),
    deleteTask: build.mutation<DeletedTask, string>({
      query: (id) => ({ op: 'remove', collection: COLLECTION, id }),
      invalidatesTags: ['Task'],
    }),
    removeTasks: build.mutation<number, readonly string[]>({
      query: (ids) => ({ op: 'removeMany', collection: COLLECTION, ids }),
      invalidatesTags: ['Task'],
    }),
    restoreDeletedTask: build.mutation<Task, DeletedTask>({
      query: ({ record, index }) => ({
        op: 'restore',
        collection: COLLECTION,
        record,
        index,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useCreateTasksMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useRemoveTasksMutation,
  useRestoreDeletedTaskMutation,
} = taskApi;