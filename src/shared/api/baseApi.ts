import { createApi } from '@reduxjs/toolkit/query/react';
import { storageBaseQuery } from './storageBaseQuery';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: storageBaseQuery,
  tagTypes: ['Task', 'Event', 'Project', 'Note', 'Category', 'Workspace'],
  endpoints: () => ({}),
});