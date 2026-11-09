import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  SearchPriorityFilter,
  SearchScope,
  SearchStatusFilter,
} from '../types/searchScreen';

interface SearchScreenState {
  isOpen: boolean;
  term: string;
  scope: SearchScope;
  status: SearchStatusFilter;
  priority: SearchPriorityFilter;
}

interface DaySearchState {
  query: string;
  screen: SearchScreenState;
}

const initialScreen: SearchScreenState = {
  isOpen: false,
  term: '',
  scope: 'all',
  status: 'all',
  priority: 'all',
};

const initialState: DaySearchState = {
  query: '',
  screen: initialScreen,
};

const daySearchSlice = createSlice({
  name: 'daySearch',
  initialState,
  reducers: {
    searchQueryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    searchScreenOpened(state) {
      state.screen = { ...initialScreen, isOpen: true };
    },
    searchScreenClosed(state) {
      state.screen.isOpen = false;
    },
    searchTermChanged(state, action: PayloadAction<string>) {
      state.screen.term = action.payload;
    },
    searchScopeChanged(state, action: PayloadAction<SearchScope>) {
      state.screen.scope = action.payload;
    },
    searchStatusChanged(state, action: PayloadAction<SearchStatusFilter>) {
      state.screen.status = action.payload;
    },
    searchPriorityChanged(state, action: PayloadAction<SearchPriorityFilter>) {
      state.screen.priority = action.payload;
    },
  },
});

export const {
  searchQueryChanged,
  searchScreenOpened,
  searchScreenClosed,
  searchTermChanged,
  searchScopeChanged,
  searchStatusChanged,
  searchPriorityChanged,
} = daySearchSlice.actions;
export const daySearchReducer = daySearchSlice.reducer;

export const selectSearchQuery = (state: { daySearch: DaySearchState }): string =>
  state.daySearch.query;

export const selectSearchScreen = (state: { daySearch: DaySearchState }): SearchScreenState =>
  state.daySearch.screen;