const pad = (value: number): string => String(value).padStart(2, '0');

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getTodayKey = (): string => toDateKey(new Date());

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number) as [number, number, number];
  return new Date(year, month - 1, day);
};