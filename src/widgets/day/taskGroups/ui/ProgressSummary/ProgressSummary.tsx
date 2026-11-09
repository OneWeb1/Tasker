import { useId } from 'react';
import type { Category } from '@/entities/category';
import type { Task, TaskProgress } from '@/entities/task';
import { formatDuration } from '@/shared/lib/utils/date';
import { AnimatedHeight } from '@/shared/ui/AnimatedHeight';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { CircleProgress } from '@/shared/ui/CircleProgress';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { useProgressSummary } from '../../model/hooks/useProgressSummary';
import { CategoryProgressRow } from './CategoryProgressRow';
import styles from './ProgressSummary.module.css';
import { WeekProgress } from './WeekProgress';

interface ProgressSummaryProps {
  groups: readonly {
    category: Category;
    progress: TaskProgress;
    items: readonly { task: Task }[];
  }[];
  date: string;
  onSelectDate: (dateKey: string) => void;
}

export function ProgressSummary({ groups, date, onSelectDate }: ProgressSummaryProps) {
  const {
    isExpanded,
    toggle,
    statsDateLabel,
    totalProgress,
    stats,
    categoryEntries,
    weekPanels,
    canShiftPreviousWeek,
    canShiftNextWeek,
    shiftWeek,
    selectStatsDate,
  } = useProgressSummary(groups, date, onSelectDate);
  const panelId = useId();
  const hasTime = stats.plannedMinutes > 0 || stats.untimedCount > 0;

  return (
    <section className={styles.card} aria-label="Загальний прогрес">
      <button
        type="button"
        className={styles.header}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className={styles.title}>Загальний прогрес</span>
        <span className={styles.value}>
          <AnimatedNumber value={totalProgress.done} />/
          <AnimatedNumber value={totalProgress.total} /> ·{' '}
          <AnimatedNumber value={totalProgress.percent} />%
        </span>
        <ChevronDownIcon className={styles.chevron} width={18} height={18} />
      </button>

      <div id={panelId} className={styles.collapse} data-open={isExpanded}>
        <div className={styles.inner}>
          <div className={styles.details}>
            <div className={styles.summary}>
              <CircleProgress className={styles.totalRing} percent={totalProgress.percent}>
                <span className={styles.percent}>
                  <AnimatedNumber value={totalProgress.percent} />%
                </span>
              </CircleProgress>
              <dl className={styles.counters}>
                <div className={styles.counter}>
                  <dt>Виконано</dt>
                  <dd>
                    <AnimatedNumber value={totalProgress.done} />
                  </dd>
                </div>
                <div className={styles.counter}>
                  <dt>Залишилось</dt>
                  <dd>
                    <AnimatedNumber value={stats.remaining} />
                  </dd>
                </div>
              </dl>
            </div>

            {weekPanels && (
              <div className={styles.block}>
                <div className={styles.blockHeader}>
                  <h3 className={styles.blockTitle}>Тиждень</h3>
                  <span key={statsDateLabel} className={styles.blockDate} aria-live="polite">
                    {statsDateLabel}
                  </span>
                </div>
                <WeekProgress
                  panels={weekPanels}
                  canShiftPrevious={canShiftPreviousWeek}
                  canShiftNext={canShiftNextWeek}
                  onSelect={selectStatsDate}
                  onShiftWeek={shiftWeek}
                />
              </div>
            )}

            <AnimatedHeight>
            <div className={styles.statsBlocks}>
            <div className={`${styles.block} ${styles.blockCategories}`}>
              <h3 className={styles.blockTitle}>По категоріях</h3>
              <ul className={styles.categories}>
                {categoryEntries.map(({ key, item, isLeaving, isInitial }) => (
                  <CategoryProgressRow
                    key={key}
                    category={item.category}
                    progress={item.progress}
                    isLeaving={isLeaving}
                    isInitial={isInitial}
                  />
                ))}
              </ul>
            </div>

            <div className={styles.collapsible} data-open={hasTime}>
              <div className={styles.collapsibleInner}>
                <div className={`${styles.block} ${styles.blockTime}`}>
                  <h3 className={styles.blockTitle}>Час</h3>
                  <dl className={styles.timeList}>
                    <div className={styles.collapsible} data-open={stats.plannedMinutes > 0}>
                      <div className={styles.collapsibleInner}>
                        <div className={styles.timeRow}>
                          <dt>Заплановано</dt>
                          <dd>
                            <AnimatedNumber value={stats.plannedMinutes} format={formatDuration} />
                          </dd>
                        </div>
                        <div className={styles.timeRow}>
                          <dt>Виконано</dt>
                          <dd>
                            <AnimatedNumber value={stats.doneMinutes} format={formatDuration} />
                          </dd>
                        </div>
                      </div>
                    </div>
                    <div className={styles.collapsible} data-open={stats.untimedCount > 0}>
                      <div className={styles.collapsibleInner}>
                        <div className={styles.timeRow}>
                          <dt>Без часу</dt>
                          <dd>
                            <AnimatedNumber value={stats.untimedCount} />
                          </dd>
                        </div>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            </div>
            </AnimatedHeight>
          </div>
        </div>
      </div>
    </section>

  );
}