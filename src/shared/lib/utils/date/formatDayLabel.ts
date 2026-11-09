const LOCALE = 'uk-UA';

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const formatDayLabel = (date: Date, style: 'weekday' | 'weekdayLong' | 'month'): string => {
  if (style === 'month') {
    return capitalize(new Intl.DateTimeFormat(LOCALE, { month: 'long' }).format(date));
  }
  if (style === 'weekdayLong') {
    return capitalize(new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(date));
  }
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short' }).format(date).toUpperCase();
};