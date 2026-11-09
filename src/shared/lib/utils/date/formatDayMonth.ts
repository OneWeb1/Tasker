import { parseDateKey } from './dateKey';

const FORMAT = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' });

export const formatDayMonth = (dateKey: string): string => FORMAT.format(parseDateKey(dateKey));