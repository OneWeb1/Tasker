import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  accentChanged,
  customAccentChanged,
  selectAccent,
  selectCustomAccent,
  selectTheme,
  selectUserName,
  themeChanged,
  userNameChanged,
} from '../slice/settingsSlice';
import type { AccentColor } from '../constants/accent';
import type { Theme } from '../slice/settingsSlice';

const INVISIBLE_CHARS = /[\p{Cc}\p{Cf}]/gu;
const VISIBLE_INITIAL = /[\p{L}\p{N}]/u;

const getInitial = (name: string): string =>
  name.match(VISIBLE_INITIAL)?.[0].toUpperCase() ?? '';

export function useSettings() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const accent = useSelector(selectAccent);
  const customAccent = useSelector(selectCustomAccent);
  const userName = useSelector(selectUserName);

  const setTheme = useCallback(
    (next: Theme) => {
      dispatch(themeChanged(next));
    },
    [dispatch],
  );

  const setAccent = useCallback(
    (next: AccentColor) => {
      dispatch(accentChanged(next));
    },
    [dispatch],
  );

  const setCustomAccent = useCallback(
    (next: string) => {
      dispatch(customAccentChanged(next));
    },
    [dispatch],
  );

  const setUserName = useCallback(
    (next: string) => {
      dispatch(userNameChanged(next.replace(INVISIBLE_CHARS, '').trim()));
    },
    [dispatch],
  );

  return {
    theme,
    setTheme,
    accent,
    setAccent,
    customAccent,
    setCustomAccent,
    userName,
    userInitial: getInitial(userName),
    setUserName,
  };
}