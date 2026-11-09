import styles from './DayPill.module.css';

interface DayPillProps {
  weekday: string;
  day: number;
  isActive: boolean;
  isToday: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export function DayPill({ weekday, day, isActive, isToday, isDisabled, onClick }: DayPillProps) {
  return (
    <button
      type="button"
      className={styles.pill}
      data-active={isActive}
      data-today={isToday}
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={onClick}
    >
      <span className={styles.day}>{day}</span>
      <span className={styles.weekday}>{weekday}</span>
    </button>
  );
}