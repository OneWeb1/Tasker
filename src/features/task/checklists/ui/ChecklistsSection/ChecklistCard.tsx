import { getChecklistProgress, useDiffKind } from '@/entities/task';
import type { TaskChecklist } from '@/entities/task';
import { useLongPress } from '@/shared/lib/hooks/useLongPress';
import { DiffSign } from '@/shared/ui/DiffSign';
import { ListIcon } from '@/shared/ui/icons';
import styles from './ChecklistsSection.module.css';

const noop = () => undefined;

interface ChecklistCardProps {
  checklist: TaskChecklist;
  isSelected: boolean;
  isSelecting: boolean;
  onClick: () => void;
  onLongPress?: () => void;
}

export function ChecklistCard({
  checklist,
  isSelected,
  isSelecting,
  onClick,
  onLongPress,
}: ChecklistCardProps) {
  const longPress = useLongPress({ onLongPress: onLongPress ?? noop });
  const progress = getChecklistProgress(checklist);
  const kind = useDiffKind(checklist.id);

  return (
    <li className={styles.cardItem} data-diff={kind}>
      <DiffSign kind={kind} placement="corner" />
      <button
        type="button"
        className={styles.card}
        data-complete={progress.total > 0 && progress.done === progress.total}
        data-selected={isSelecting ? isSelected : undefined}
        aria-haspopup={isSelecting ? undefined : 'dialog'}
        aria-pressed={isSelecting ? isSelected : undefined}
        {...(onLongPress ? longPress : undefined)}
        onClick={onClick}
      >
        <ListIcon className={styles.cardIcon} width={28} height={28} />
        <span className={styles.cardText}>
          <span className={styles.cardTitle}>{checklist.title}</span>
          <span className={styles.cardMeta}>
            {progress.done}/{progress.total} виконано
          </span>
        </span>
      </button>
    </li>
  );
}