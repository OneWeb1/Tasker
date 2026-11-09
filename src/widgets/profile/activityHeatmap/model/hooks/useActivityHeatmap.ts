import { useMemo, useState } from 'react';
import { calculateTaskActivity, useGetTasksQuery } from '@/entities/task';
import { getTodayKey, parseDateKey } from '@/shared/lib/utils/date';
import { ACTIVITY_WEEKS } from '../constants/activity';
import { buildActivityGrid, getActivityRange } from '../lib/buildActivityGrid';

const DAY_FORMAT = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' });
const DAY_YEAR_FORMAT = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const MONTH_FORMAT = new Intl.DateTimeFormat('uk-UA', { month: 'short' });

export function useActivityHeatmap() {
  const { data: tasks } = useGetTasksQuery();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const todayKey = getTodayKey();

  const view = useMemo(() => {
    const todayYear = parseDateKey(todayKey).getFullYear();
    const formatDate = (dateKey: string): string => {
      const date = parseDateKey(dateKey);
      return (date.getFullYear() === todayYear ? DAY_FORMAT : DAY_YEAR_FORMAT).format(date);
    };
    const range = getActivityRange(todayKey, ACTIVITY_WEEKS);
    const activity = calculateTaskActivity(tasks ?? [], range.from, todayKey);
    const grid = buildActivityGrid(activity, todayKey, ACTIVITY_WEEKS);

    return {
      cells: grid.cells.map((cell) => ({
        ...cell,
        label: cell.isFuture ? '' : formatDate(cell.dateKey),
        summary:
          cell.total === 0 ? 'Немає завдань' : `${cell.done} із ${cell.total} (${cell.percent}%)`,
      })),
      months: grid.months.map((month) => ({
        column: month.column,
        label: MONTH_FORMAT.format(new Date(2000, month.monthIndex, 1)),
      })),
    };
  }, [tasks, todayKey]);

  const activeKey = selectedKey ?? todayKey;

  return {
    weeks: ACTIVITY_WEEKS,
    cells: view.cells,
    months: view.months,
    selected: view.cells.find((cell) => cell.dateKey === activeKey),
    selectDate: setSelectedKey,
  };
}