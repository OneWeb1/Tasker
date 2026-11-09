import { useCallback, useState } from 'react';
import { useSettings } from '@/features/settings/managePreferences';
import { useResetHistory } from '@/features/settings/resetData';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';

export function useProfileHeaderActions() {
  const [, navigate] = useHashPath();
  const { theme, setTheme } = useSettings();
  const history = useResetHistory();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const goBack = useCallback(() => {
    navigate(ROUTE_PATHS.today);
  }, [navigate]);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeHistory = useCallback(() => setIsHistoryOpen(false), []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsMenuOpen(false);
  }, [theme, setTheme]);

  const openHistory = useCallback(() => {
    setIsMenuOpen(false);
    setIsHistoryOpen(true);
  }, []);

  return {
    isDark: theme === 'dark',
    history,
    isMenuOpen,
    isHistoryOpen,
    goBack,
    openMenu,
    closeMenu,
    closeHistory,
    toggleTheme,
    openHistory,
  };
}