import { ArrowRightIcon } from '@/shared/ui/icons';
import type { TaskTimeRange } from '@/entities/task';
import { useOperationsScreen } from '../../model/hooks/useOperationsScreen';
import { useTaskOperations } from '../../model/hooks/useTaskOperations';
import { TaskOperationRow } from '../TaskOperationRow';
import styles from './TaskOperations.module.css';

interface TaskOperationsProps {
  range: TaskTimeRange | null;
  periodLabel: string;
}

export function TaskOperations({ range, periodLabel }: TaskOperationsProps) {
  const { items, resolveCategory, openTask } = useTaskOperations(range);
  const { open } = useOperationsScreen();

  return (
    <section className={styles.card} aria-label="Операції">
      <div className={styles.header}>
        <h2 className={styles.title}>Операції</h2>
        <button
          type="button"
          className={styles.all}
          aria-haspopup="dialog"
          onClick={() => open(range, periodLabel)}
        >
          Усі
          <ArrowRightIcon width={16} height={16} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          Витрати часу з’являться після виконання завдань із заданим часом
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((entry) => (
            <TaskOperationRow
              key={entry.id}
              entry={entry}
              category={resolveCategory(entry.task)}
              onOpen={() => openTask(entry.task)}
            />
          ))}
        </ul>
      )}
    </section>

  );
}