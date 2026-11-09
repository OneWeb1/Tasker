import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CollapsedEventsState {
  ids: string[];
}

const initialState: CollapsedEventsState = { ids: [] };

const collapsedEventsSlice = createSlice({
  name: 'collapsedEvents',
  initialState,
  reducers: {
    eventCollapseToggled(state, action: PayloadAction<string>) {
      const index = state.ids.indexOf(action.payload);
      if (index === -1) state.ids.push(action.payload);
      else state.ids.splice(index, 1);
    },
  },
});

export const { eventCollapseToggled } = collapsedEventsSlice.actions;
export const collapsedEventsReducer = collapsedEventsSlice.reducer;

export const selectCollapsedEventIds = (state: {
  collapsedEvents: CollapsedEventsState;
}): string[] => state.collapsedEvents.ids;