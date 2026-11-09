import { useMemo, useState } from 'react';
import {
  buildMonthGrid,
  formatDayLabel,
  moveToMonth,
  parseDateKey,
} from '@/shared/lib/utils/date';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { IconButton } from '@/shared/ui/IconButton';
import { ChevronDownIcon, TodayIcon } from '@/shared/ui/icons';
import { MonthGrid } from '@/shared/ui/MonthGrid';
import { getYearPageStart, YearGrid, YEARS_PER_PAGE } from '@/shared/ui/YearGrid';
import styles from './RangeCalendar.module.css';

interface RangeCalendarProps {
  monthKey: string;
  start: string | null;
  end: string | null;
  today: string;
  minDate?: string;
  maxDate?: string;
  onSelect: (dateKey: string) => void;
  onMonthChange: (monthKey: string) => void;
}

const WEEKDAY_LABELS = Array.from({ length: 7 }, (_, index) =>
  formatDayLabel(new Date(2024, 0, 1 + index), 'weekday'),
);

export function RangeCalendar({
  monthKey,
  start,
  end,
  today,
  minDate,
  maxDate,
  onSelect,
  onMonthChange,
}: RangeCalendarProps) {
  const monthDate = parseDateKey(monthKey);
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const days = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);
  const hasRange = start !== null && end !== null && end > start;
  const [isMonthsOpen, setIsMonthsOpen] = useState(false);
  const [isYearsOpen, setIsYearsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const [yearsStart, setYearsStart] = useState(() => getYearPageStart(year));
  const todayDate = parseDateKey(today);

  const openMonths = () => {
    setPickerYear(year);
    setIsMonthsOpen(true);
  };

  const closeMonths = () => {
    setIsYearsOpen(false);
    setIsMonthsOpen(false);
  };

  const openYears = () => {
    setYearsStart(getYearPageStart(pickerYear));
    setIsYearsOpen(true);
  };

  const closeYears = () => {
    setIsYearsOpen(false);
  };

  const shiftMonth = (delta: 1 | -1) => {
    onMonthChange(moveToMonth(monthKey, year, monthIndex + delta));
  };

  const shiftPickerYear = (delta: 1 | -1) => {
    setPickerYear((value) => value + delta);
  };

  const shiftYearsPage = (delta: 1 | -1) => {
    setYearsStart((value) => value + delta * YEARS_PER_PAGE);
  };

  const selectMonth = (index: number) => {
    onMonthChange(moveToMonth(monthKey, pickerYear, index));
    closeMonths();
  };

  const selectYear = (value: number) => {
    setPickerYear(value);
    setIsYearsOpen(false);
  };

  const selectToday = () => {
    onMonthChange(today);
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <h3 className={styles.title} aria-live="polite">
          <button
            type="button"
            className={styles.titleButton}
            data-open={isMonthsOpen}
            aria-haspopup="dialog"
            aria-expanded={isMonthsOpen}
            onClick={openMonths}
          >
            <span>{`${formatDayLabel(monthDate, 'month')} ${year}`}</span>
            <ChevronDownIcon className={styles.chevron} width={16} height={16} />
          </button>
        </h3>
        <IconButton label="Сьогодні" size="lg" onClick={selectToday}>
          <TodayIcon filled={false} width={20} height={20} />
        </IconButton>
        <IconButton label="Попередній місяць" size="lg" onClick={() => shiftMonth(-1)}>
          <ChevronDownIcon className={styles.prev} width={20} height={20} />
        </IconButton>
        <IconButton label="Наступний місяць" size="lg" onClick={() => shiftMonth(1)}>
          <ChevronDownIcon width={20} height={20} />
        </IconButton>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className={styles.grid} role="group" aria-label="Дні місяця">
        {days.map((day) => {
          const isStart = day.key === start;
          const isEnd = hasRange && day.key === end;
          const isInRange = hasRange && day.key > start && day.key < end;

          return (
            <button
              key={day.key}
              type="button"
              className={styles.cell}
              data-outside={!day.isCurrentMonth}
              data-today={day.key === today}
              data-in-range={isInRange}
              data-range-start={isStart && hasRange}
              data-range-end={isEnd}
              disabled={
                (minDate !== undefined && day.key < minDate) ||
                (maxDate !== undefined && day.key > maxDate)
              }
              aria-pressed={isStart || isEnd}
              aria-current={day.key === today ? 'date' : undefined}
              onClick={() => onSelect(day.key)}
            >
              <span className={styles.day} data-selected={isStart || isEnd}>
                {day.day}
              </span>
            </button>
          );
        })}
      </div>

      <BottomSheet isOpen={isMonthsOpen} title="Оберіть місяць" onClose={closeMonths}>
        <div className={styles.picker}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              <button
                type="button"
                className={styles.titleButton}
                data-open={isYearsOpen}
                aria-haspopup="dialog"
                aria-expanded={isYearsOpen}
                onClick={openYears}
              >
                <span>{pickerYear}</span>
                <ChevronDownIcon className={styles.chevron} width={16} height={16} />
              </button>
            </h3>
            <IconButton label="Попередній рік" size="lg" onClick={() => shiftPickerYear(-1)}>
              <ChevronDownIcon className={styles.prev} width={20} height={20} />
            </IconButton>
            <IconButton label="Наступний рік" size="lg" onClick={() => shiftPickerYear(1)}>
              <ChevronDownIcon width={20} height={20} />
            </IconButton>
          </div>
          <MonthGrid
            selectedMonthIndex={pickerYear === year ? monthIndex : null}
            currentMonthIndex={pickerYear === todayDate.getFullYear() ? todayDate.getMonth() : null}
            onSelect={selectMonth}
          />
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isYearsOpen} title="Оберіть рік" onClose={closeYears}>
        <div className={styles.picker}>
          <div className={styles.header}>
            <h3 className={styles.title} aria-live="polite">
              {yearsStart}–{yearsStart + YEARS_PER_PAGE - 1}
            </h3>
            <IconButton label="Попередні роки" size="lg" onClick={() => shiftYearsPage(-1)}>
              <ChevronDownIcon className={styles.prev} width={20} height={20} />
            </IconButton>
            <IconButton label="Наступні роки" size="lg" onClick={() => shiftYearsPage(1)}>
              <ChevronDownIcon width={20} height={20} />
            </IconButton>
          </div>
          <YearGrid
            startYear={yearsStart}
            selectedYear={pickerYear}
            currentYear={todayDate.getFullYear()}
            onSelect={selectYear}
          />
        </div>
      </BottomSheet>
    </div>

  );
}