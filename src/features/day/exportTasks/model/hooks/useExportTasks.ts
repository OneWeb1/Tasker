import { useCallback, useMemo, useState } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import { useGetProjectsQuery } from '@/entities/project';
import { useGetTasksQuery } from '@/entities/task';
import { getMonthRange, getWeekRange, parseDateKey } from '@/shared/lib/utils/date';
import type { DateRange } from '@/shared/lib/utils/date';
import { saveFile } from '@/shared/lib/utils/file';
import { useToast } from '@/shared/ui/Toast';
import { buildExportPreview } from '../lib/buildExportPreview';
import { buildTasksExport } from '../lib/buildTasksExport';
import { collectExportRows } from '../lib/collectExportRows';
import { isExportRangeValid } from '../lib/isExportRangeValid';
import type { ExportFormat } from '../types/exportFormat';
import type { ExportMode, ExportPreset, ExportView } from '../types/exportOptions';

type SaveStatus = 'idle' | 'saving' | 'error';

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function useExportTasks(defaultDate: string, isOpen: boolean, onClose: () => void) {
  const { data: tasks } = useGetTasksQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: projects } = useGetProjectsQuery();
  const { showToast } = useToast();

  const [view, setView] = useState<ExportView>('menu');
  const [mode, setMode] = useState<ExportMode>('day');
  const [from, setFrom] = useState(defaultDate);
  const [to, setTo] = useState(defaultDate);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setView('menu');
      setMode('day');
      setFrom(defaultDate);
      setTo(defaultDate);
      setFormat('csv');
      setStatus('idle');
    }
  }

  const range = useMemo<DateRange>(
    () => (mode === 'day' ? { from: defaultDate, to: defaultDate } : { from, to }),
    [defaultDate, from, mode, to],
  );
  const isRangeValid = isExportRangeValid(range.from, range.to);

  const rows = useMemo(
    () =>
      isRangeValid
        ? collectExportRows(tasks ?? [], categories ?? [], projects ?? [], range.from, range.to)
        : [],
    [categories, isRangeValid, projects, range, tasks],
  );

  const file = useMemo(
    () => (isRangeValid && rows.length > 0 ? buildTasksExport(rows, range, format) : null),
    [format, isRangeValid, range, rows],
  );
  const preview = useMemo(() => (file ? buildExportPreview(file.content) : null), [file]);

  const openExport = useCallback((next: ExportMode) => {
    setMode(next);
    setStatus('idle');
    setView('export');
  }, []);

  const backToMenu = useCallback(() => {
    setStatus('idle');
    setView('menu');
  }, []);

  const openPreview = useCallback(() => {
    setView('preview');
  }, []);

  const closePreview = useCallback(() => {
    setView('export');
  }, []);



  const applyPreset = useCallback(
    (preset: ExportPreset) => {
      const next = preset === 'week' ? getWeekRange(defaultDate) : getMonthRange(defaultDate);
      setFrom(next.from);
      setTo(next.to);
    },
    [defaultDate],
  );

  const exportTasks = useCallback(async () => {
        if (!file) return;

    setStatus('saving');
    try {
      const isSaved = await saveFile(file.filename, file.content, file.mime);
      if (!isSaved) {
        setStatus('idle');
        return;
      }
      showToast({ message: 'Експортовано' });
      onClose();
    } catch {
      setStatus('error');
    }

  }, [file, onClose, showToast]);

  return {
    view,
    mode,
    openExport,
    backToMenu,
    openPreview,
    closePreview,
    from,
    setFrom,
    to,
    setTo,
    format,
    setFormat,
    applyPreset,
    dayLabel: DAY_LABEL_FORMAT.format(parseDateKey(defaultDate)),
    rowsCount: rows.length,
    filename: file?.filename ?? '',
    preview,
    isRangeValid,
    canExport: isRangeValid && rows.length > 0,
    isSaving: status === 'saving',
    hasError: status === 'error',
    exportTasks,
  };
}