import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import {
  ACCENT_COLORS,
  CUSTOM_ACCENT_ID,
  useSettings,
} from '@/features/settings/managePreferences';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, accent, customAccent } = useSettings();

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useLayoutEffect(() => {
    const { style } = document.documentElement;
    if (accent === CUSTOM_ACCENT_ID) {
      style.setProperty('--color-primary-accent', customAccent);
      style.setProperty(
        '--color-primary-accent-bg',
        theme === 'dark'
          ? `color-mix(in srgb, ${customAccent} 25%, #121212)`
          : `color-mix(in srgb, ${customAccent} 14%, #ffffff)`,
      );
      return;
    }
    const option = ACCENT_COLORS.find((item) => item.id === accent) ?? ACCENT_COLORS[0];
    style.setProperty('--color-primary-accent', option.color);
    style.setProperty(
      '--color-primary-accent-bg',
      theme === 'dark' ? option.softDark : option.softLight,
    );
  }, [accent, customAccent, theme]);

  return <>{children}</>;
}