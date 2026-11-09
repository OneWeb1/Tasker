import { baseApi } from '@/shared/api';
import type {
  Category,
  CategoryId,
  DeletedCategory,
  NewCategory,
} from '../model/types/category';
import { categoriesMock } from './__mocks__/categoriesMock';

const COLLECTION = 'categories';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], void>({
      query: () => ({ op: 'list', collection: COLLECTION, seed: categoriesMock }),
      providesTags: ['Category'],
    }),
    createCategory: build.mutation<Category, NewCategory>({
      query: (body) => ({ op: 'create', collection: COLLECTION, body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: build.mutation<Category, { id: CategoryId; patch: Partial<NewCategory> }>({
      query: ({ id, patch }) => ({ op: 'update', collection: COLLECTION, id, patch }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: build.mutation<DeletedCategory, CategoryId>({
      query: (id) => ({ op: 'remove', collection: COLLECTION, id }),
      invalidatesTags: ['Category'],
    }),
    restoreDeletedCategory: build.mutation<Category, DeletedCategory>({
      query: ({ record, index }) => ({
        op: 'restore',
        collection: COLLECTION,
        record,
        index,
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

const categoryOrderApi = categoryApi.injectEndpoints({
  endpoints: (build) => ({
    reorderCategories: build.mutation<Category[], CategoryId[]>({
      query: (ids) => ({ op: 'reorder', collection: COLLECTION, ids }),
      async onQueryStarted(ids, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          categoryApi.util.updateQueryData('getCategories', undefined, (draft) => {
            const byId = new Map(draft.map((category) => [category.id, category] as const));
            const ordered = ids.flatMap((id) => {
              const category = byId.get(id);
              return category ? [category] : [];
            });
            const rest = draft.filter((category) => !ids.includes(category.id));
            draft.splice(0, draft.length, ...ordered, ...rest);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useRestoreDeletedCategoryMutation,
} = categoryApi;
export const { useReorderCategoriesMutation } = categoryOrderApi;