import styles from './YearGrid.module.css';

export const YEARS_PER_PAGE = 12;

export const getYearPageStart = (year: number): number => year - (year % YEARS_PER_PAGE);

interface YearGridProps {
  startYear: number;
  selectedYear: number;
  currentYear: number;
  onSelect: (year: number) => void;
}

export function YearGrid({ startYear, selectedYear, currentYear, onSelect }: YearGridProps) {
  return (
    <div className={styles.grid} role="group" aria-label="Роки">
      {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
        const year = startYear + index;
        const isSelected = year === selectedYear;
        const isCurrent = year === currentYear;

        return (
          <button
            key={year}
            type="button"
            className={styles.year}
            data-selected={isSelected}
            data-current={isCurrent}
            aria-pressed={isSelected}
            aria-current={isCurrent ? 'date' : undefined}
            onClick={() => onSelect(year)}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
}