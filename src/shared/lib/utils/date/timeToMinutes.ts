export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number) as [number, number];
  return hours * 60 + minutes;
};