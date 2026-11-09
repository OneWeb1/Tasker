import type { Project } from '@/entities/project';
import { useLongPress } from '@/shared/lib/hooks/useLongPress';
import { CheckIcon } from '@/shared/ui/icons';
import styles from './ProjectRow.module.css';

interface ProjectRowProps {
  project: Project;
  openTasksCount: number;
  isActive: boolean;
  isSelecting: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function ProjectRow({
  project,
  openTasksCount,
  isActive,
  isSelecting,
  isSelected,
  onPress,
  onLongPress,
}: ProjectRowProps) {
  const longPress = useLongPress({ onLongPress });

  return (
    <li>
      <button
        type="button"
        className={styles.row}
        aria-current={(!isSelecting && isActive) || undefined}
        aria-pressed={isSelecting ? isSelected : undefined}
        data-selected={isSelecting ? isSelected : undefined}
        onClick={onPress}
        {...longPress}
      >
        <span className={styles.emoji} aria-hidden="true">
          {project.emoji}
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{project.title}</span>
          <span className={styles.meta}>
            {openTasksCount === 0 ? 'Немає активних завдань' : `Активних: ${openTasksCount}`}
          </span>
        </span>
        {isSelecting ? (
          <span className={styles.check} data-checked={isSelected} aria-hidden="true">
            {isSelected && <CheckIcon width={14} height={14} />}
          </span>
        ) : (
          isActive && (
            <span className={styles.activeMark} aria-hidden="true">
              <CheckIcon width={14} height={14} />
            </span>
          )
        )}
      </button>
    </li>
  );
}