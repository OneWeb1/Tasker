import { addDaysToKey, getWeekRange } from '@/shared/lib/utils/date';
import type { DatesBounds } from '../../types/datesBounds';

type PresetBounds = Pick<DatesBounds, 'minDate' | 'maxDate'>;

export type DatePresetIcon = 'tomorrow' | 'week' | 'nextWeek';

export interface DatePreset {
  id: string;
  label: string;
  icon?: DatePresetIcon;
  start: string;
  end: string | null;
}

const isWithinBounds = (preset: DatePreset, { minDate, maxDate }: PresetBounds): boolean =>
  (maxDate === undefined || preset.start <= maxDate) &&
  (minDate === undefined || (preset.end ?? preset.start) >= minDate);

export const buildDatePresets = (today: string, bounds: PresetBounds = {}): DatePreset[] => {
  const week = getWeekRange(today);

  const presets: DatePreset[] = [
    { id: 'today', label: 'Сьогодні', start: today, end: null },
    { id: 'tomorrow', label: 'Завтра', icon: 'tomorrow', start: addDaysToKey(today, 1), end: null },
    {
      id: 'thisWeek',
      label: 'Цей тиждень',
      icon: 'week',
      start: today,
      end: week.to > today ? week.to : null,
    },
    {
      id: 'nextWeek',
      label: 'Наступний тиждень',
      icon: 'nextWeek',
      start: addDaysToKey(week.to, 1),
      end: addDaysToKey(week.to, 7),
    },
  ];

  return presets.filter((preset) => isWithinBounds(preset, bounds));
};