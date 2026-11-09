export const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} хв`;
  if (minutes === 0) return `${hours} год`;
  return `${hours} год ${minutes} хв`;
};