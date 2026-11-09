import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PERIOD_SCALE,
  buildPeriods,
  getPeriodAnchor,
  getPeriodLabel,
  getPeriodProgress,
} from '@/entities/period';
import type { Period, PeriodScale } from '@/entities/period';
import { calculateRangeProgress, filterByProject, useGetTasksQuery } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { addDaysToKey, getTodayKey } from '@/shared/lib/utils/date';
import type { PeriodCarouselItem } from '../types/periodItem';
import type { PeriodSelection } from '../types/periodSelection';

export function usePeriodCarousel(onActiveChange?: (selection: PeriodSelection) => void) {
  const today = getTodayKey();
  const [scale, setScale] = useState<PeriodScale>(DEFAULT_PERIOD_SCALE);
  const [anchor, setAnchor] = useState<string>(today);
  const { data: tasks } = useGetTasksQuery();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();

  const scopedTasks = useMemo(
    () => filterByProject(filterByWorkspace(tasks ?? [], workspace.id), activeProjectId),
    [activeProjectId, tasks, workspace.id],
  );

  const completionOf = useMemo(() => {
    const cache = new Map<string, number>();

    return (from: string, to: string): number => {
      const key = `${from}|${to}`;
      const cached = cache.get(key);
      if (cached !== undefined) return cached;

      const percent = calculateRangeProgress(scopedTasks, from, to).percent;
      cache.set(key, percent);
      return percent;
    };
  }, [scopedTasks]);

  const toItem = useMemo(() => {
    const cache = new Map<string, PeriodCarouselItem>();

    return (period: Period): PeriodCarouselItem => {
      const key = `${period.id}|${period.paletteIndex}|${period.title}`;
      const cached = cache.get(key);
      if (cached) return cached;

      const item: PeriodCarouselItem = {
        period,
        progress: getPeriodProgress(period, today),
        get completion() {
          return completionOf(period.startDate, period.endDate);
        },
        label: getPeriodLabel(scale, period, today),
        isCurrent: period.startDate <= today && today <= period.endDate,
      };
      cache.set(key, item);
      return item;
    };
  }, [completionOf, scale, today]);

  const builtPeriods = useMemo(
    () => buildPeriods(scale, { anchorKey: anchor, todayKey: today }),
    [scale, anchor, today],
  );
  const periodsKey = builtPeriods.map(({ id }) => id).join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const periods = useMemo(() => builtPeriods, [periodsKey]);
  const items = useMemo(() => periods.map(toItem), [periods, toItem]);

  const adjacent = useMemo(() => {
    const first = items[0];
    const last = items[items.length - 1];
    if (scale === 'year' || !first || !last) return { prev: null, next: null };

    const resolve = (anchorKey: string) => {
      const list = buildPeriods(scale, { anchorKey, todayKey: today });
      const position = list.findIndex(
        (period) => period.startDate <= anchorKey && anchorKey <= period.endDate,
      );
      const period = list[position];
      if (!period) return null;
      return { anchorKey, item: toItem(period), index: position, count: list.length };
    };

    return {
      prev: resolve(addDaysToKey(first.period.startDate, -1)),
      next: resolve(addDaysToKey(last.period.endDate, 1)),
    };

  }, [items, scale, today, toItem]);

  const index = Math.max(
    items.findIndex(({ period }) => period.startDate <= anchor && anchor <= period.endDate),
    0,
  );

  const select = useCallback(
    (next: number) => {
      if (next > items.length - 1 && adjacent.next) {
        setAnchor(adjacent.next.anchorKey);
        return;
      }
      if (next < 0 && adjacent.prev) {
        setAnchor(adjacent.prev.anchorKey);
        return;
      }
      const target = items[Math.min(Math.max(next, 0), items.length - 1)];
      if (target) setAnchor(getPeriodAnchor(scale, target.period, anchor));
    },
    [items, adjacent, scale, anchor],
  );

  const neighborAt = useCallback(
    (position: number) => {
      if (position < 0) return adjacent.prev;
      if (position > items.length - 1) return adjacent.next;
      const item = items[position];
      return item ? { item, index: position, count: items.length } : null;
    },
    [items, adjacent],
  );

  const goToToday = useCallback(() => setAnchor(today), [today]);

  const selectionAt = useCallback(
    (position: number): PeriodSelection | null => {
      const item = neighborAt(position)?.item;
      if (!item) return null;
      return { from: item.period.startDate, to: item.period.endDate, label: item.label };
    },
    [neighborAt],
  );

  const active = items[index] ?? null;
  const label = active?.label ?? '';
  const isCurrent = active?.isCurrent ?? true;

  const activeFrom = active?.period.startDate;
  const activeTo = active?.period.endDate;
  useEffect(() => {
    if (activeFrom && activeTo) onActiveChange?.({ from: activeFrom, to: activeTo, label });
  }, [activeFrom, activeTo, label, onActiveChange]);

  return {
    scale,
    changeScale: setScale,
    items,
    index,
    active,
    label,
    isCurrent,
    goToToday,
    select,
    selectionAt,
    neighborAt,
  };
}