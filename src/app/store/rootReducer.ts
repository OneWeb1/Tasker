import { combineReducers } from '@reduxjs/toolkit';
import { createItemReducer } from '@/features/createItem';
import { collapsedEventsReducer } from '@/features/day/collapseEvents';
import { daySearchReducer } from '@/features/day/searchDay';
import { selectedDateReducer } from '@/features/day/selectDate';
import { dayTabReducer } from '@/features/day/switchTab';
import { notesViewReducer } from '@/features/note/browseNotes';
import { noteSortReducer } from '@/features/note/sortNotes';
import { activeProjectReducer } from '@/features/project/filterByProject';
import { connectedCalendarsReducer } from '@/features/settings/connectCalendars';
import { settingsReducer } from '@/features/settings/managePreferences';
import { activeWorkspaceReducer } from '@/features/workspace/switchWorkspace';
import { baseApi } from '@/shared/api';

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  createItem: createItemReducer,
  selectedDate: selectedDateReducer,
  dayTab: dayTabReducer,
  collapsedEvents: collapsedEventsReducer,
  daySearch: daySearchReducer,
  noteSort: noteSortReducer,
  notesView: notesViewReducer,
  connectedCalendars: connectedCalendarsReducer,
  settings: settingsReducer,
  activeWorkspace: activeWorkspaceReducer,
  activeProject: activeProjectReducer,
});