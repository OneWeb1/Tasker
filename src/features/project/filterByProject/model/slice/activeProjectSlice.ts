import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ActiveProjectState {
  id: string | null;
}

const initialState: ActiveProjectState = { id: null };

const activeProjectSlice = createSlice({
  name: 'activeProject',
  initialState,
  reducers: {
    projectSelected(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    projectCleared(state) {
      state.id = null;
    },
  },
});

export const { projectSelected, projectCleared } = activeProjectSlice.actions;
export const activeProjectReducer = activeProjectSlice.reducer;

export const selectActiveProjectId = (state: { activeProject: ActiveProjectState }): string | null =>
  state.activeProject.id;