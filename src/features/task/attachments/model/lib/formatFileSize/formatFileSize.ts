const KB = 1024;
const MB = KB * 1024;

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 }).format(value);

export const formatFileSize = (bytes: number): string => {
  if (bytes >= MB) return `${formatNumber(bytes / MB)} МБ`;
  if (bytes >= KB) return `${formatNumber(bytes / KB)} КБ`;
  return `${bytes} Б`;
};