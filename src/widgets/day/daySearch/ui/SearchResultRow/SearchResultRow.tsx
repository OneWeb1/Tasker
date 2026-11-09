import type { TaskSearchEntry } from '@/entities/task';
import { CheckIcon, PostponeIcon, StatusIcon } from '@/shared/ui/icons';
import styles from './SearchResultRow.module.css';

interface SearchResultRowProps {
  entry: TaskSearchEntry;
  context: string | null;
  onOpen: (entry: TaskSearchEntry) => void;
}

const STATUS_ICONS = {
  active: StatusIcon,
  done: CheckIcon,
  postponed: PostponeIcon,
} as const;

export function SearchResultRow({ entry, context, onOpen }: SearchResultRowProps) {
  const Icon = STATUS_ICONS[entry.status];

  return (
    <li>
      <button type="button" className={styles.row} onClick={() => onOpen(entry)}>
        <span className={styles.status} data-status={entry.status} aria-hidden="true">
          <Icon width={26} height={26} />
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{entry.title}</span>
          {context && <span className={styles.context}>У {context}</span>}
        </span>
      </button>
    </li>
  );
}