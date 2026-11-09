import type { TaskHistoryItem } from '../../model/hooks/useTaskHistory';
import { TASK_STATUS_LABELS } from '../../model/constants/taskScreen';
import { ArrowRightIcon, CheckIcon, EditIcon, StatusIcon } from '@/shared/ui/icons';
import { TaskStatusIcon } from '../TaskStatusIcon';
import styles from './TaskHistory.module.css';

const ICON_SIZE = 20;

interface TaskHistoryProps {
  items: readonly TaskHistoryItem[];
}

const renderIcon = (kind: TaskHistoryItem['kind']) => {
  if (kind === 'created') return <CheckIcon width={ICON_SIZE} height={ICON_SIZE} />;
  if (kind === 'field') return <EditIcon width={ICON_SIZE} height={ICON_SIZE} />;
  return <StatusIcon width={ICON_SIZE} height={ICON_SIZE} />;
};

export function TaskHistory({ items }: TaskHistoryProps) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.list} aria-label="Історія змін">
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <span className={styles.icon}>{renderIcon(item.kind)}</span>
          <div className={styles.content}>
            <p className={styles.text}>{item.title}</p>
            {item.status && (
              <p className={styles.status}>
                <ArrowRightIcon width={ICON_SIZE} height={ICON_SIZE} />
                <TaskStatusIcon status={item.status} />
                <span className={styles.statusLabel}>{TASK_STATUS_LABELS[item.status]}</span>
              </p>
            )}
            {item.value && (
              <p className={styles.status}>
                <ArrowRightIcon width={ICON_SIZE} height={ICON_SIZE} />
                <span className={styles.value}>{item.value}</span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}