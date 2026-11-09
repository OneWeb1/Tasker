const pad = (value: number): string => String(value).padStart(2, '0');

export const formatTimer = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};