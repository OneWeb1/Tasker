import { ArrowLeftIcon, MoreIcon } from '@/shared/ui/icons';
import styles from './TaskTopBar.module.css';

interface TaskTopBarProps {
  onBack: () => void;
  onMore?: () => void;
}

export function TaskTopBar({ onBack, onMore }: TaskTopBarProps) {
  return (
    <div className={styles.bar}>
      <button type="button" className={styles.button} aria-label="Назад" onClick={onBack}>
        <ArrowLeftIcon width={24} height={24} />
      </button>
      {onMore && (
        <button
          type="button"
          className={styles.button}
          aria-label="Дії із завданням"
          aria-haspopup="dialog"
          onClick={onMore}
        >
          <MoreIcon width={24} height={24} />
        </button>
      )}
    </div>
  );
}