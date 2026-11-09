import { FlagIcon } from '@/shared/ui/icons';
import { TASK_PRIORITY_LABELS } from '../../model/constants/taskPriorities';
import type { TaskPriority } from '../../model/types/taskPriority';
import styles from './TaskPriorityBadge.module.css';

interface TaskPriorityBadgeProps {
  priority?: TaskPriority;
  variant?: 'label' | 'mark' | 'chip';
}

export function TaskPriorityBadge({ priority, variant = 'label' }: TaskPriorityBadgeProps) {
  if (!priority) {
    if (variant !== 'chip') return null;
    return (
      <span className={styles.badge} data-icon="true" data-empty="true">
        <FlagIcon width={14} height={14} />
        Не обрано
      </span>
    );
  }
  if (variant === 'mark') {
    return (
      <span
        className={styles.mark}
        data-priority={priority}
        role="img"
        aria-label={`Пріоритет: ${TASK_PRIORITY_LABELS[priority]}`}
        title={TASK_PRIORITY_LABELS[priority]}
      >
        !
      </span>
    );
  }

  if (variant === 'chip') {
    return (
      <span className={styles.badge} data-priority={priority} data-icon="true">
        <FlagIcon width={14} height={14} />
        {TASK_PRIORITY_LABELS[priority]}
      </span>
    );
  }

  return (
    <span className={styles.badge} data-priority={priority}>
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}