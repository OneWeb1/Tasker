import { IconButton } from '@/shared/ui/IconButton';
import { ChevronDownIcon, CloseIcon, SettingsIcon } from '@/shared/ui/icons';
import { useDayHeader } from '../../model/hooks/useDayHeader';
import { MonthPicker } from '../MonthPicker';
import { WeekStrip } from '../WeekStrip';
import styles from './DayHeader.module.css';

interface DayHeaderProps {
  settingsLabel: string;
  onOpenSettings: () => void;
}

export function DayHeader({ settingsLabel, onOpenSettings }: DayHeaderProps) {
  const {
    monthLabel,
    weeks,
    canShiftPrevious,
    canShiftNext,
    minDate,
    maxDate,
    selectDate,
    shiftWeek,
    isPickerOpen,
    pickerMonthKey,
    todayKey,
    openPicker,
    closePicker,
    changePickerMonth,
    pickDate,
    selectedDate,
    activeProject,
    clearProject,
  } = useDayHeader();

  return (
    <header className={styles.header}>
      <div className={styles.top}>
      <button
        type="button"
        className={styles.month}
        aria-label="Обрати місяць"
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
        data-open={isPickerOpen}
        onClick={openPicker}
      >
        <span>{monthLabel}</span>
        <ChevronDownIcon className={styles.chevron} width={16} height={16} />
      </button>
      <IconButton
        variant="ghost"
        label={settingsLabel}
        aria-haspopup="dialog"
        onClick={onOpenSettings}
      >
        <SettingsIcon width={18} height={18} />
      </IconButton>
      </div>
      {activeProject && (
        <button
          type="button"
          className={styles.filter}
          aria-label={`Скинути фільтр за проєктом: ${activeProject.title}`}
          onClick={clearProject}
        >
          <span aria-hidden="true">{activeProject.emoji}</span>
          <span className={styles.filterTitle}>{activeProject.title}</span>
          <CloseIcon width={14} height={14} />
        </button>
      )}
      <WeekStrip
        weeks={weeks}
        canShiftPrevious={canShiftPrevious}
        canShiftNext={canShiftNext}
        onSelect={selectDate}
        onShiftWeek={shiftWeek}
      />
      <MonthPicker
        isOpen={isPickerOpen}
        monthKey={pickerMonthKey}
        selectedDate={selectedDate}
        today={todayKey}
        minDate={minDate}
        maxDate={maxDate}
        onClose={closePicker}
        onMonthChange={changePickerMonth}
        onSelectDate={pickDate}
      />
    </header>
  );
}