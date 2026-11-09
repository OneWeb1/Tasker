import { useCallback, useMemo, useState } from 'react';
import { useGetProjectsQuery } from '@/entities/project';
import { useSelectedDate } from '@/features/day/selectDate';
import { useActiveProject } from '@/features/project/filterByProject';
import {
  addDaysToKey,
  formatDayLabel,
  getWeekDays,
  parseDateKey,
  toDateKey,
} from '@/shared/lib/utils/date';

export function useDayHeader() {
  const { selectedDate, bounds, selectDate, shiftWeek } = useSelectedDate();
  const { activeProjectId, clearProject } = useActiveProject();
  const { data: projects } = useGetProjectsQuery();
  const activeProject = projects?.find((project) => project.id === activeProjectId);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const todayKey = toDateKey(new Date());
  const selected = parseDateKey(selectedDate);
  const selectedYear = selected.getFullYear();

  const [pickerMonthKey, setPickerMonthKey] = useState(selectedDate);

  const monthLabel = `${formatDayLabel(selected, 'month')} ${selectedYear}`;

  const weeks = useMemo(() => {
    const buildWeek = (anchorKey: string, activeKey: string) =>
      getWeekDays(anchorKey).map((day) => ({
        ...day,
        isSelected: day.dateKey === activeKey,
        isToday: day.dateKey === todayKey,
        isDisabled: bounds !== null && (day.dateKey < bounds.from || day.dateKey > bounds.to),
      }));

    const previousKey = addDaysToKey(selectedDate, -7);
    const nextKey = addDaysToKey(selectedDate, 7);

    return {
      previous: buildWeek(previousKey, previousKey),
      current: buildWeek(selectedDate, selectedDate),
      next: buildWeek(nextKey, nextKey),
    };
  }, [bounds, selectedDate, todayKey]);

  const canShiftPrevious = weeks.previous.some((day) => !day.isDisabled);
  const canShiftNext = weeks.next.some((day) => !day.isDisabled);

  const openPicker = useCallback(() => {
    setPickerMonthKey(selectedDate);
    setIsPickerOpen(true);
  }, [selectedDate]);

  const closePicker = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  const changePickerMonth = useCallback((monthKey: string) => {
    setPickerMonthKey(monthKey);
  }, []);

  const pickDate = useCallback(
    (dateKey: string) => {
      selectDate(dateKey);
      setIsPickerOpen(false);
    },
    [selectDate],
  );

  return {
    monthLabel,
    activeProject,
    clearProject,
    weeks,
    canShiftPrevious,
    canShiftNext,
    minDate: bounds?.from,
    maxDate: bounds?.to,
    selectedDate,
    selectDate,
    shiftWeek,
    isPickerOpen,
    pickerMonthKey,
    todayKey,
    openPicker,
    closePicker,
    changePickerMonth,
    pickDate,
  };
}