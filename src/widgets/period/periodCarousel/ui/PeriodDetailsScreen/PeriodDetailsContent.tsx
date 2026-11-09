import { getCategoryColorStyle } from '@/entities/category';
import type { Category } from '@/entities/category';
import { pluralizeDays } from '@/entities/period';
import { formatDuration } from '@/shared/lib/utils/date';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { useCategoryScreen } from '../../model/hooks/useCategoryScreen';
import { usePeriodDetails } from '../../model/hooks/usePeriodDetails';
import type { PeriodCarouselItem } from '../../model/types/periodItem';
import styles from './PeriodDetailsScreen.module.css';

interface PeriodDetailsContentProps {
  item: PeriodCarouselItem;
}

export function PeriodDetailsContent({ item }: PeriodDetailsContentProps) {
  const { period, progress } = item;
  const { progress: tasksProgress, spentMinutes, categoryRows } = usePeriodDetails(
    period.startDate,
    period.endDate,
  );
  const isFinished = progress.status === 'finished';
  const { open: openCategoryScreen } = useCategoryScreen();

  const openCategory = (category: Category) =>
    openCategoryScreen({ category, period, periodLabel: item.label });

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {tasksProgress.done}
            <span className={styles.statTotal}> / {tasksProgress.total}</span>
          </span>
          <span className={styles.statLabel}>Виконано завдань</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{isFinished ? '—' : progress.daysLeft}</span>
          <span className={styles.statLabel}>
            {isFinished ? 'Завершено' : `${pluralizeDays(progress.daysLeft)} залишилось`}
          </span>
        </div>
        <div className={`${styles.stat} ${styles.statWide}`}>
          <span className={styles.statValue}>{formatDuration(spentMinutes)}</span>
          <span className={styles.statLabel}>Витрачено часу</span>
        </div>
      </div>

      <h3 className={styles.heading}>Категорії</h3>
      {categoryRows.length === 0 ? (
        <p className={styles.empty}>Завдань у цьому проміжку немає</p>
      ) : (
        <ul className={styles.categories}>
          {categoryRows.map(({ category, progress: categoryProgress }) => (
            <li key={category.id}>
              <button
                type="button"
                className={styles.category}
                data-color={category.color}
                style={getCategoryColorStyle(category.color)}
                aria-haspopup="dialog"
                onClick={() => openCategory(category)}
              >
                <span className={styles.categoryTop}>
                  <span className={styles.categoryTitle}>{category.title}</span>
                  <span className={styles.categoryValue}>
                    {categoryProgress.done} / {categoryProgress.total}
                  </span>
                </span>
                <ProgressBar
                  done={categoryProgress.done}
                  total={categoryProgress.total}
                  label={category.title}
                  animateOnMount
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>

  );
}