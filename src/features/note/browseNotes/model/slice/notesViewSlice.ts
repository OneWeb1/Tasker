import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type NotesView = 'recents' | 'alphabetical' | 'archived';

interface NotesViewState {
  view: NotesView;
  tag: string | null;
}

const initialState: NotesViewState = {
  view: 'recents',
  tag: null,
};

const notesViewSlice = createSlice({
  name: 'notesView',
  initialState,
  reducers: {
    notesViewChanged(state, action: PayloadAction<NotesView>) {
      state.view = action.payload;
    },
    notesTagChanged(state, action: PayloadAction<string | null>) {
      state.tag = action.payload;
    },
  },
});

export const { notesTagChanged, notesViewChanged } = notesViewSlice.actions;
export const notesViewReducer = notesViewSlice.reducer;

export const selectNotesView = (state: { notesView: NotesViewState }): NotesView =>
  state.notesView.view;

export const selectNotesTag = (state: { notesView: NotesViewState }): string | null =>
  state.notesView.tag;