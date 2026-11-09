import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_WORKSPACE } from '@/entities/workspace';
import { readValue } from '@/shared/lib/utils/storage';

export const ACTIVE_WORKSPACE_STORAGE_KEY = 'activeWorkspace';

interface ActiveWorkspaceState {
  id: string;
}

const stored = readValue<Partial<ActiveWorkspaceState> | null>(ACTIVE_WORKSPACE_STORAGE_KEY, null);

const initialState: ActiveWorkspaceState = {
  id: typeof stored?.id === 'string' ? stored.id : DEFAULT_WORKSPACE.id,
};

const activeWorkspaceSlice = createSlice({
  name: 'activeWorkspace',
  initialState,
  reducers: {
    workspaceActivated(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
  },
});

export const { workspaceActivated } = activeWorkspaceSlice.actions;
export const activeWorkspaceReducer = activeWorkspaceSlice.reducer;

export const selectActiveWorkspaceId = (state: { activeWorkspace: ActiveWorkspaceState }): string =>
  state.activeWorkspace.id;