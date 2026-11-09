import { formatDayMonth, formatShortDate, getTodayKey } from '@/shared/lib/utils/date';
import type { Category } from '@/entities/category';
import type { Task, TaskTimeRange } from '@/entities/task';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { formatSpent } from '../../model/lib/formatSpent';
import type { TimeEntryGroup } from '../../model/lib/groupEntriesByDate';
import { TaskOperationRow } from '../TaskOperationRow';
import styles from './TaskOperationsScreen.module.css';

interface TaskOperationsScreenProps {
  isOpen: boolean;
  periodLabel: string;
  range: TaskTimeRange | null;
  groups: readonly TimeEntryGroup[];
  totalMs: number;
  resolveCategory: (task: Task) => Category | undefined;
  isScrollLocked: boolean;
  onOpenTask: (task: Task) => void;
  onClose: () => void;
}

const formatRange = (range: TaskTimeRange): string =>
  range.from === range.to
    ? formatShortDate(range.from)
    : `${formatShortDate(range.from)} — ${formatShortDate(range.to)}`;

export function TaskOperationsScreen({
  isOpen,
  periodLabel,
  range,
  groups,
  totalMs,
  resolveCategory,
  isScrollLocked,
  onOpenTask,
  onClose,
}: TaskOperationsScreenProps) {
  const today = getTodayKey();

  return (
    <SlideScreen
      isOpen={isOpen}
      title="Операції"
      isHeaderPlain
      isScrollLocked={isScrollLocked}
      onClose={onClose}
    >
      <div className={styles.content}>
        <div className={styles.summary}>
          <span className={styles.period}>{periodLabel}</span>
          {range && <span className={styles.range}>{formatRange(range)}</span>}
          {totalMs > 0 && <span className={styles.total}>−{formatSpent(totalMs)}</span>}
        </div>

        {groups.length === 0 ? (
          <p className={styles.empty}>За цей проміжок витрат часу немає</p>
        ) : (
          groups.map(({ dateKey, entries }) => (
            <section key={dateKey} className={styles.group}>
              <h3 className={styles.heading}>
                {dateKey === today ? 'Сьогодні' : formatDayMonth(dateKey)}
              </h3>
              <ul className={styles.list}>
                {entries.map((entry) => (
                  <TaskOperationRow
                    key={entry.id}
                    entry={entry}
                    category={resolveCategory(entry.task)}
                    showDate={false}
                    onOpen={() => onOpenTask(entry.task)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </SlideScreen>
  );
}