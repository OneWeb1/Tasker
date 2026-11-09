import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type DayTab = 'tasks' | 'events' | 'notes';
export type TaskFilter = 'all' | 'active' | 'postponed' | 'done';

interface DayTabState {
  value: DayTab;
  taskFilter: TaskFilter;
  hideEmptyCategories: boolean;
}

const initialState: DayTabState = {
  value: 'tasks',
  taskFilter: 'active',
  hideEmptyCategories: true,
};

const dayTabSlice = createSlice({
  name: 'dayTab',
  initialState,
  reducers: {
    dayTabChanged(state, action: PayloadAction<DayTab>) {
      state.value = action.payload;
    },
    taskFilterChanged(state, action: PayloadAction<TaskFilter>) {
      state.taskFilter = action.payload;
    },
    hideEmptyCategoriesChanged(state, action: PayloadAction<boolean>) {
      state.hideEmptyCategories = action.payload;
    },
  },
});

export const { dayTabChanged, taskFilterChanged, hideEmptyCategoriesChanged } =
  dayTabSlice.actions;
export const dayTabReducer = dayTabSlice.reducer;

export const selectDayTab = (state: { dayTab: DayTabState }): DayTab => state.dayTab.value;
export const selectTaskFilter = (state: { dayTab: DayTabState }): TaskFilter =>
  state.dayTab.taskFilter;
export const selectHideEmptyCategories = (state: { dayTab: DayTabState }): boolean =>
  state.dayTab.hideEmptyCategories;