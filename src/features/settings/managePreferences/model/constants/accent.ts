export const ACCENT_COLORS = [
  { id: 'violet', label: 'Фіолетовий', color: '#6d4aff', softLight: '#ebe6ff', softDark: '#2a2447' },
  { id: 'blue', label: 'Синій', color: '#3b82f6', softLight: '#e1ecff', softDark: '#1e2a44' },
  { id: 'green', label: 'Зелений', color: '#3a9d2f', softLight: '#e0f0d0', softDark: '#22381d' },
  { id: 'orange', label: 'Помаранчевий', color: '#f08a24', softLight: '#fbe8d2', softDark: '#3f2c17' },
  { id: 'pink', label: 'Рожевий', color: '#e0529c', softLight: '#fadcec', softDark: '#40222f' },
] as const;

export const CUSTOM_ACCENT_ID = 'custom';
export const CUSTOM_ACCENT_LABEL = 'Власний';
export const DEFAULT_CUSTOM_ACCENT = '#e5412d';

export type AccentColor = (typeof ACCENT_COLORS)[number]['id'] | typeof CUSTOM_ACCENT_ID;

export const DEFAULT_ACCENT: AccentColor = 'violet';

export const isAccentColor = (value: unknown): value is AccentColor =>
  value === CUSTOM_ACCENT_ID || ACCENT_COLORS.some((item) => item.id === value);

export const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);