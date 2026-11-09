import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type NoteSortOrder = 'newest' | 'oldest' | 'title';

interface NoteSortState {
  order: NoteSortOrder;
}

const initialState: NoteSortState = {
  order: 'newest',
};

const noteSortSlice = createSlice({
  name: 'noteSort',
  initialState,
  reducers: {
    noteSortOrderChanged(state, action: PayloadAction<NoteSortOrder>) {
      state.order = action.payload;
    },
  },
});

export const { noteSortOrderChanged } = noteSortSlice.actions;
export const noteSortReducer = noteSortSlice.reducer;

export const selectNoteSortOrder = (state: { noteSort: NoteSortState }): NoteSortOrder =>
  state.noteSort.order;