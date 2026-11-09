import { parseDateKey } from './dateKey';

const FORMAT = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' });

export const formatShortDate = (dateKey: string): string => FORMAT.format(parseDateKey(dateKey));