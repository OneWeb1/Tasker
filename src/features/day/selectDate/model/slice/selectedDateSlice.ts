import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toDateKey } from '@/shared/lib/utils/date';
import type { DateRange } from '@/shared/lib/utils/date';

interface SelectedDateState {
  value: string;
  bounds: DateRange | null;
}

const initialState: SelectedDateState = { value: toDateKey(new Date()), bounds: null };

const clampDate = (dateKey: string, bounds: DateRange | null): string => {
  if (!bounds) return dateKey;
  if (dateKey < bounds.from) return bounds.from;
  if (dateKey > bounds.to) return bounds.to;
  return dateKey;
};

const selectedDateSlice = createSlice({
  name: 'selectedDate',
  initialState,
  reducers: {
    dateSelected(state, action: PayloadAction<string>) {
      state.value = clampDate(action.payload, state.bounds);
    },
    boundsChanged(state, action: PayloadAction<DateRange | null>) {
      state.bounds = action.payload;
      state.value = clampDate(state.value, action.payload);
    },
  },
});

export const { dateSelected, boundsChanged } = selectedDateSlice.actions;
export const selectedDateReducer = selectedDateSlice.reducer;

export const selectSelectedDate = (state: { selectedDate: SelectedDateState }): string =>
  state.selectedDate.value;
export const selectDateBounds = (state: { selectedDate: SelectedDateState }): DateRange | null =>
  state.selectedDate.bounds;