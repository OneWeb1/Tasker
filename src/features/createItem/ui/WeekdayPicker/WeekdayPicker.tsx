import { TASK_WEEKDAYS } from '@/entities/task';
import styles from './WeekdayPicker.module.css';

interface WeekdayPickerProps {
  value: readonly number[];
  onToggle: (weekday: number) => void;
}

export function WeekdayPicker({ value, onToggle }: WeekdayPickerProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>Повторювати у дні</span>
      <div className={styles.list} role="group" aria-label="Дні тижня">
        {TASK_WEEKDAYS.map((weekday) => {
          const isSelected = value.includes(weekday.value);
          return (
            <button
              key={weekday.value}
              type="button"
              className={styles.day}
              data-selected={isSelected}
              aria-pressed={isSelected}
              aria-label={weekday.fullLabel}
              onClick={() => onToggle(weekday.value)}
            >
              {weekday.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}