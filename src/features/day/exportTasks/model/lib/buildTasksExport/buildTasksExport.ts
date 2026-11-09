import type { DateRange } from '@/shared/lib/utils/date';
import { EXPORT_FORMAT_META } from '../../constants/export';
import type { ExportFormat } from '../../types/exportFormat';
import type { ExportRow } from '../../types/exportRow';
import { toCsv, toJson, toText } from './serializers';

interface ExportFile {
  filename: string;
  mime: string;
  content: string;
}

const SERIALIZERS: Record<
  ExportFormat,
  (rows: readonly ExportRow[], range: DateRange) => string
> = {
  csv: toCsv,
  json: toJson,
  text: toText,
};

export const buildTasksExport = (
  rows: readonly ExportRow[],
  range: DateRange,
  format: ExportFormat,
): ExportFile => {
  const { extension, mime } = EXPORT_FORMAT_META[format];
  const suffix = range.from === range.to ? range.from : `${range.from}_${range.to}`;

  return {
    filename: `tasker-${suffix}.${extension}`,
    mime,
    content: SERIALIZERS[format](rows, range),
  };
};