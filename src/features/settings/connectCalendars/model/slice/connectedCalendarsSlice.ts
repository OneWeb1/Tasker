import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { EXTERNAL_EVENT_SOURCES } from '@/entities/event';
import type { ExternalEventSource } from '@/entities/event';
import { readValue } from '@/shared/lib/utils/storage';

export const CONNECTED_CALENDARS_STORAGE_KEY = 'connectedCalendars';

interface ConnectedCalendarsState {
  sources: ExternalEventSource[];
}

const stored = readValue<Partial<ConnectedCalendarsState> | null>(
  CONNECTED_CALENDARS_STORAGE_KEY,
  null,
);

const storedSources = stored?.sources;

const initialState: ConnectedCalendarsState = {
  sources: Array.isArray(storedSources)
    ? EXTERNAL_EVENT_SOURCES.filter((source) => storedSources.includes(source))
    : [...EXTERNAL_EVENT_SOURCES],
};

const connectedCalendarsSlice = createSlice({
  name: 'connectedCalendars',
  initialState,
  reducers: {
    calendarToggled(state, action: PayloadAction<ExternalEventSource>) {
      const source = action.payload;
      state.sources = state.sources.includes(source)
        ? state.sources.filter((item) => item !== source)
        : [...state.sources, source];
    },
  },
});

export const { calendarToggled } = connectedCalendarsSlice.actions;
export const connectedCalendarsReducer = connectedCalendarsSlice.reducer;

export const selectConnectedSources = (state: {
  connectedCalendars: ConnectedCalendarsState;
}): ExternalEventSource[] => state.connectedCalendars.sources;