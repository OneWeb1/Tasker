import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { readValue } from '@/shared/lib/utils/storage';
import {
  CUSTOM_ACCENT_ID,
  DEFAULT_ACCENT,
  DEFAULT_CUSTOM_ACCENT,
  isAccentColor,
  isHexColor,
} from '../constants/accent';
import type { AccentColor } from '../constants/accent';

export type Theme = 'light' | 'dark';

export const SETTINGS_STORAGE_KEY = 'settings';

interface SettingsState {
  theme: Theme;
  accent: AccentColor;
  customAccent: string;
  userName: string;
  userAvatar: string | null;
}

const stored = readValue<Partial<SettingsState> | null>(SETTINGS_STORAGE_KEY, null);

const getInitialTheme = (): Theme => {
  if (stored?.theme === 'dark' || stored?.theme === 'light') return stored.theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialAccent = (): AccentColor =>
  isAccentColor(stored?.accent) ? stored.accent : DEFAULT_ACCENT;

const getInitialCustomAccent = (): string =>
  isHexColor(stored?.customAccent) ? stored.customAccent : DEFAULT_CUSTOM_ACCENT;

const getInitialUserName = (): string =>
  typeof stored?.userName === 'string' ? stored.userName : '';

const getInitialUserAvatar = (): string | null =>
  typeof stored?.userAvatar === 'string' && stored.userAvatar.startsWith('data:image/')
    ? stored.userAvatar
    : null;

const initialState: SettingsState = {
  theme: getInitialTheme(),
  accent: getInitialAccent(),
  customAccent: getInitialCustomAccent(),
  userName: getInitialUserName(),
  userAvatar: getInitialUserAvatar(),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    themeChanged(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    accentChanged(state, action: PayloadAction<AccentColor>) {
      state.accent = action.payload;
    },
    customAccentChanged(state, action: PayloadAction<string>) {
      if (!isHexColor(action.payload)) return;
      state.customAccent = action.payload;
      state.accent = CUSTOM_ACCENT_ID;
    },
    userNameChanged(state, action: PayloadAction<string>) {
      state.userName = action.payload;
    },
    userAvatarChanged(state, action: PayloadAction<string | null>) {
      state.userAvatar = action.payload;
    },
  },
});

export const {
  themeChanged,
  accentChanged,
  customAccentChanged,
  userNameChanged,
  userAvatarChanged,
} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

export const selectTheme = (state: { settings: SettingsState }): Theme => state.settings.theme;

export const selectAccent = (state: { settings: SettingsState }): AccentColor =>
  state.settings.accent;

export const selectCustomAccent = (state: { settings: SettingsState }): string =>
  state.settings.customAccent;

export const selectUserName = (state: { settings: SettingsState }): string =>
  state.settings.userName;

export const selectUserAvatar = (state: { settings: SettingsState }): string | null =>
  state.settings.userAvatar;