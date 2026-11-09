import type { CSSProperties } from 'react';
import { getCategoryColorStyle } from '@/entities/category';
import type { Category } from '@/entities/category';
import { formatDayMonth, formatDuration, getTodayKey } from '@/shared/lib/utils/date';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { CheckIcon, StatusIcon } from '@/shared/ui/icons';
import { useCategoryDetails } from '../../model/hooks/useCategoryDetails';
import styles from './CategoryDetailsScreen.module.css';

interface CategoryDetailsScreenProps {
  isOpen: boolean;
  category: Category | null;
  from: string;
  to: string;
  periodLabel: string;
  surfaceStyle: CSSProperties;
  isScrollLocked: boolean;
  onOpenTask: (taskId: string) => void;
  onClose: () => void;
}

export function CategoryDetailsScreen({
  isOpen,
  category,
  from,
  to,
  periodLabel,
  surfaceStyle,
  isScrollLocked,
  onOpenTask,
  onClose,
}: CategoryDetailsScreenProps) {
  const details = useCategoryDetails(category?.id ?? null, from, to);
  if (!category || !details) return null;

  const today = getTodayKey();
  const { progress, remaining, spentMinutes, history } = details;

  return (
    <SlideScreen
      isOpen={isOpen}
      title={category.title}
      isHeaderPlain
      isTitleLarge
      isScrollLocked={isScrollLocked}
      surfaceStyle={surfaceStyle}
      onClose={onClose}
    >
      <div className={styles.content}>
        <div
          className={styles.hero}
          data-color={category.color}
          style={getCategoryColorStyle(category.color)}
        >
          <span className={styles.emoji} aria-hidden="true">
            {category.emoji}
          </span>
          <div className={styles.heroText}>
            <span className={styles.percent}>{progress.percent}%</span>
            <span className={styles.period}>{periodLabel}</span>
          </div>
          <div className={styles.heroBar}>
            <ProgressBar
              done={progress.done}
              total={progress.total}
              label={`Прогрес категорії ${category.title}`}
              animateOnMount
            />
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {progress.done}
              <span className={styles.statTotal}> / {progress.total}</span>
            </span>
            <span className={styles.statLabel}>Виконано</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{remaining}</span>
            <span className={styles.statLabel}>Залишилось</span>
          </div>
          <div className={`${styles.stat} ${styles.statWide}`}>
            <span className={styles.statValue}>{formatDuration(spentMinutes)}</span>
            <span className={styles.statLabel}>Витрачено часу</span>
          </div>
        </div>

        <h3 className={styles.heading}>Історія</h3>
        {history.length === 0 ? (
          <p className={styles.empty}>Записів за цей проміжок немає</p>
        ) : (
          history.map(({ dateKey, entries }) => (
            <section key={dateKey} className={styles.group}>
              <h4 className={styles.date}>
                {dateKey === today ? 'Сьогодні' : formatDayMonth(dateKey)}
              </h4>
              <ul className={styles.list}>
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className={styles.row}
                      data-done={entry.isDone || undefined}
                      onClick={() => onOpenTask(entry.taskId)}
                    >
                      <span className={styles.mark} aria-hidden="true">
                        {entry.isDone ? (
                          <CheckIcon width={14} height={14} />
                        ) : (
                          <StatusIcon width={22} height={22} />
                        )}
                      </span>
                      <span className={styles.text}>
                        <span className={styles.name}>{entry.title}</span>
                        {entry.timeLabel && <span className={styles.time}>{entry.timeLabel}</span>}
                      </span>
                      {entry.spentMinutes !== null && (
                        <span className={styles.state}>−{formatDuration(entry.spentMinutes)}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </SlideScreen>
  );
}