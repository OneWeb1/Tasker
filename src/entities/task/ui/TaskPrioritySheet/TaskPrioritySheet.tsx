import type { TaskPriority } from '../../model/types/taskPriority';
import { TASK_PRIORITY_LABELS } from '../../model/constants/taskPriorities';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { CheckIcon, FlagIcon } from '@/shared/ui/icons';
import styles from './TaskPrioritySheet.module.css';

const PRIORITIES: readonly TaskPriority[] = ['high', 'medium', 'low'];

interface TaskPrioritySheetProps {
  isOpen: boolean;
  value: TaskPriority | undefined;
  onSelect: (priority: TaskPriority | undefined) => void;
  onClose: () => void;
}

export function TaskPrioritySheet({ isOpen, value, onSelect, onClose }: TaskPrioritySheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Пріоритет" onClose={onClose}>
      <p className={styles.section}>Оберіть пріоритет</p>
      <MenuGroup>
        {PRIORITIES.map((priority) => (
          <MenuItem
            key={priority}
            icon={
              <span className={styles.flag} data-priority={priority}>
                <FlagIcon width={22} height={22} />
              </span>
            }
            label={TASK_PRIORITY_LABELS[priority]}
            isSelected={priority === value}
            trailing={priority === value ? <CheckIcon width={20} height={20} /> : undefined}
            onClick={() => onSelect(priority)}
          />
        ))}
      </MenuGroup>
      <button
        type="button"
        className={styles.clear}
        disabled={value === undefined}
        onClick={() => onSelect(undefined)}
      >
        Очистити
      </button>
    </BottomSheet>
  );
}