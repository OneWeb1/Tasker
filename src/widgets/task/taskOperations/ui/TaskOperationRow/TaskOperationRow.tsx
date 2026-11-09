import { getCategoryColorStyle } from '@/entities/category';
import type { Category } from '@/entities/category';
import type { TaskTimeEntry } from '@/entities/task';
import { formatShortDate } from '@/shared/lib/utils/date';
import { ClockIcon } from '@/shared/ui/icons';
import { formatSpent } from '../../model/lib/formatSpent';
import styles from './TaskOperationRow.module.css';

interface TaskOperationRowProps {
  entry: TaskTimeEntry;
  category?: Category;
  showDate?: boolean;
  onOpen: () => void;
}

export function TaskOperationRow({
  entry,
  category,
  showDate = true,
  onOpen,
}: TaskOperationRowProps) {
  return (
    <li>
      <button type="button" className={styles.row} aria-haspopup="dialog" onClick={onOpen}>
      {category ? (
        <span
          className={styles.icon}
          data-color={category.color}
          style={getCategoryColorStyle(category.color)}
          aria-hidden="true"
        >
          {category.emoji}
        </span>
      ) : (
        <span className={styles.icon} aria-hidden="true">
          <ClockIcon width={22} height={22} />
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.name}>{entry.title}</span>
        {showDate && <span className={styles.date}>{formatShortDate(entry.dateKey)}</span>}
      </span>
      <span className={styles.amount}>−{formatSpent(entry.durationMs)}</span>
      </button>
    </li>
  );
}