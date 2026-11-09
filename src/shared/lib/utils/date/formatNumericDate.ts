import { parseDateKey } from './dateKey';

const FORMAT = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

export const formatNumericDate = (dateKey: string): string => FORMAT.format(parseDateKey(dateKey));