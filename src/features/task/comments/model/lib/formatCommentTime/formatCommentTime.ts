const TIME_FORMAT = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const MS_PER_DAY = 86_400_000;

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const formatDaysAgo = (days: number): string => {
  const noun = days >= 2 && days <= 4 ? 'дні' : 'днів';
  return `${days} ${noun} тому`;
};

export const formatCommentTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / MS_PER_DAY);
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const time = TIME_FORMAT.format(date);

  if (daysAgo <= 0) return time;
  if (daysAgo === 1) return `Вчора о ${time}`;
  if (daysAgo <= daysSinceMonday) return `${formatDaysAgo(daysAgo)} о ${time}`;
  return DATE_TIME_FORMAT.format(date);
};