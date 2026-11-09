import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/shared/api';
import { persistState } from './persistState';
import { rootReducer } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

persistState(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;