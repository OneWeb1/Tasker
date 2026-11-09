import type { ExportFormat } from '../types/exportFormat';
import type { ExportPreset } from '../types/exportOptions';

export const MAX_EXPORT_DAYS = 366;

export const EXPORT_FORMAT_META: Record<
  ExportFormat,
  { label: string; extension: string; mime: string }

> = {
  csv: { label: 'CSV', extension: 'csv', mime: 'text/csv;charset=utf-8' },
  json: { label: 'JSON', extension: 'json', mime: 'application/json;charset=utf-8' },
  text: { label: 'Текст', extension: 'txt', mime: 'text/plain;charset=utf-8' },
};

export const EXPORT_FORMATS: readonly { value: ExportFormat; label: string }[] = (
  ['csv', 'json', 'text'] as const
).map((value) => ({ value, label: EXPORT_FORMAT_META[value].label }));

export const EXPORT_PRESET_ITEMS: readonly { value: ExportPreset; label: string }[] = [
  { value: 'week', label: 'Тиждень' },
  { value: 'month', label: 'Місяць' },
];