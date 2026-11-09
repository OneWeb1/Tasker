import { useState } from 'react';
import { getSubtaskTimeLimits } from '@/entities/task';
import type { TaskDates } from '@/features/task/editTask';
import { getTodayKey, timeToMinutes } from '@/shared/lib/utils/date';
import { DEFAULT_END_TIME, DEFAULT_START_TIME } from '../constants/datesSheet';
import type { DatePreset } from '../lib/buildDatePresets';
import type { DatesBounds } from '../types/datesBounds';

export type DateField = 'start' | 'end';

interface UseDatesFormOptions {
  value: TaskDates;
  bounds: DatesBounds;
  allowEndDate: boolean;
}

export function useDatesForm({ value, bounds, allowEndDate }: UseDatesFormOptions) {
  const { minDate, maxDate } = bounds;
  const [start, setStart] = useState(value.date);
  const [end, setEnd] = useState<string | null>(
    allowEndDate && value.endDate && value.endDate > value.date ? value.endDate : null,
  );
  const [activeField, setActiveField] = useState<DateField>('start');
  const [timeField, setTimeField] = useState<DateField | null>(null);
  const [monthKey, setMonthKey] = useState(value.date);
  const [hasTime, setHasTime] = useState(Boolean(value.startTime && value.endTime));
  const [startTime, setStartTime] = useState(
    value.startTime ?? bounds.minTime ?? DEFAULT_START_TIME,
  );
  const [endTime, setEndTime] = useState(value.endTime ?? bounds.maxTime ?? DEFAULT_END_TIME);

  const timeLimits = getSubtaskTimeLimits(bounds, start, end);

  const isValid =
    start !== '' &&
    (minDate === undefined || start >= minDate) &&
    (maxDate === undefined || (start <= maxDate && (end === null || end <= maxDate))) &&
    (!hasTime ||
      (startTime !== '' &&
        endTime !== '' &&
        timeToMinutes(endTime) > timeToMinutes(startTime) &&
        (timeLimits.minTime === undefined || startTime >= timeLimits.minTime) &&
        (timeLimits.maxTime === undefined || endTime <= timeLimits.maxTime)));

    const canClear = end !== null || hasTime;

  const timeHint = !hasTime
    ? null
    : timeToMinutes(endTime) <= timeToMinutes(startTime)
      ? 'Час завершення має бути пізніше за час початку'
      : (timeLimits.minTime !== undefined && startTime < timeLimits.minTime) ||
          (timeLimits.maxTime !== undefined && endTime > timeLimits.maxTime)
        ? 'Час виходить за межі батьківського завдання'
        : null;

  const calendarMinDate = allowEndDate && activeField === 'end' ? start : minDate;

  const syncTimes = (nextStart: string, nextEnd: string | null) => {
    const limits = getSubtaskTimeLimits(bounds, nextStart, nextEnd);
    setStartTime((current) =>
      limits.minTime !== undefined && current < limits.minTime ? limits.minTime : current,
    );
    setEndTime((current) =>
      limits.maxTime !== undefined && current > limits.maxTime ? limits.maxTime : current,
    );
  };

  const commit = (nextStart: string, nextEnd: string | null) => {
    setStart(nextStart);
    setEnd(nextEnd);
    syncTimes(nextStart, nextEnd);
  };

  const selectDay = (key: string) => {
    if (!allowEndDate) {
      commit(key, null);
      return;
    }
    if (activeField === 'start') {
      commit(key, end !== null && end <= key ? null : end);
      setActiveField('end');
      return;
    }
    commit(start, key === start ? null : key);
  };

  const focusField = (field: DateField) => {
    setActiveField(field);
    setMonthKey(field === 'end' && end !== null ? end : start);
  };

  const clamp = (key: string): string => {
    if (minDate !== undefined && key < minDate) return minDate;
    if (maxDate !== undefined && key > maxDate) return maxDate;
    return key;
  };

  const applyPreset = (preset: DatePreset) => {
    const presetStart = clamp(preset.start);
    const presetEnd = allowEndDate && preset.end !== null ? clamp(preset.end) : null;
    commit(presetStart, presetEnd !== null && presetEnd > presetStart ? presetEnd : null);
    setMonthKey(presetStart);
    setActiveField(allowEndDate ? 'end' : 'start');
  };

  const clear = () => {
    setEnd(null);
    setHasTime(false);
    setActiveField('start');
  };

  const defaultStart = clamp(getTodayKey());
  const canResetStart = start !== defaultStart;

  const resetStart = () => {
    commit(defaultStart, end !== null && end > defaultStart ? end : null);
    setMonthKey(defaultStart);
    setActiveField('start');
  };

  const clearEnd = () => {
    setEnd(null);
    setActiveField('end');
    syncTimes(start, null);
  };

  const openTime = (field: DateField) => setTimeField(field);
  const closeTime = () => setTimeField(null);
  const clearTime = () => setHasTime(false);

  const saveTime = (time: string) => {
    if (timeField === 'end') setEndTime(time);
    else setStartTime(time);
    setHasTime(true);
    setTimeField(null);
  };

  const build = (): TaskDates => ({
    date: start,
    endDate: end,
    startTime: hasTime ? startTime : null,
    endTime: hasTime ? endTime : null,
  });

  return {
    start,
    end,
    activeField,
    monthKey,
    setMonthKey,
    hasTime,
    startTime,
    endTime,
    timeLimits,
    timeHint,
    timeField,
    openTime,
    closeTime,
    saveTime,
    clearTime,
    clearEnd,
    resetStart,
    canResetStart,
    calendarMinDate,
    isValid,
    canClear,
    selectDay,
    focusField,
    applyPreset,
    clear,
    build,
  };
}