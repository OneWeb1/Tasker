import type { DateRange } from '@/shared/lib/utils/date';
import type { ExportRow } from '../../types/exportRow';

const CSV_HEADER = ['Дата', 'Час', 'Назва', 'Опис', 'Категорія', 'Проєкт', 'Розклад', 'Статус'];

const escapeCsvCell = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export const toCsv = (rows: readonly ExportRow[]): string =>
  `\uFEFF${[
    CSV_HEADER,
    ...rows.map((row) => [
      row.date,
      row.time,
      row.title,
      row.description,
      row.category,
      row.project,
      row.schedule,
      row.isDone ? 'Виконано' : 'Не виконано',
    ]),
  ]
    .map((cells) => cells.map(escapeCsvCell).join(','))
    .join('\r\n')}`;

export const toJson = (rows: readonly ExportRow[], range: DateRange): string =>
  JSON.stringify({ from: range.from, to: range.to, tasks: rows }, null, 2);

const formatTextLine = (row: ExportRow): string => {
  const meta = [row.category, row.project].filter(Boolean).join(' · ');
  const line = `${row.isDone ? '[x]' : '[ ]'} ${row.time ? `${row.time} ` : ''}${row.title}${
    meta ? ` (${meta})` : ''
  }`;
  return row.description ? `${line}\n    ${row.description.replace(/\r?\n/g, '\n    ')}` : line;
};

export const toText = (rows: readonly ExportRow[]): string => {
  const byDate = new Map<string, ExportRow[]>();
  for (const row of rows) byDate.set(row.date, [...(byDate.get(row.date) ?? []), row]);

  return [...byDate]
    .map(([date, items]) => [date, ...items.map(formatTextLine)].join('\n'))
    .join('\n\n');
};