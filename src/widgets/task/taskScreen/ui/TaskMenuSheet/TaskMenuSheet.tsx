import type { Task } from '@/entities/task';
import { ActionTile } from '@/shared/ui/ActionTile';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { ArrowRightIcon, CopyIcon, EditIcon, SparklesIcon, TrashIcon } from '@/shared/ui/icons';
import type { TaskMenuView } from '../../model/hooks/useTaskScreen';
import styles from './TaskMenuSheet.module.css';

const LABELS = {
  task: {
    menu: 'Дії із завданням',
    confirm: 'Видалити завдання?',
    remove: 'Видалити завдання',
  },
  subtask: {
    menu: 'Дії з підзавданням',
    confirm: 'Видалити підзавдання?',
    remove: 'Видалити підзавдання',
  },
} as const;

interface TaskMenuSheetProps {
  task: Task;
  isOpen: boolean;
  view: TaskMenuView;
  kind?: 'task' | 'subtask';
  isRecurring: boolean;
  onClose: () => void;
  onViewChange: (view: TaskMenuView) => void;
  onEdit?: () => void;
  onDuplicate: () => void;
  onOpenAi: () => void;
  onMoveTomorrow?: () => void;
  onDelete: () => void;
}

export function TaskMenuSheet({
  task,
  isOpen,
  view,
  kind = 'task',
  isRecurring,
  onClose,
  onViewChange,
  onEdit,
  onDuplicate,
  onOpenAi,
  onMoveTomorrow,
  onDelete,
}: TaskMenuSheetProps) {
  const isDeleting = view === 'delete';
  const labels = LABELS[kind];

  return (
    <BottomSheet
      isOpen={isOpen}
      title={isDeleting ? labels.confirm : labels.menu}
      onClose={onClose}
      onBack={isDeleting ? () => onViewChange('menu') : undefined}
    >
      {!isDeleting && (
        <>
          <div className={styles.tiles}>
            {onEdit && (
              <ActionTile
                icon={<EditIcon width={24} height={24} />}
                label="Редагувати"
                onClick={onEdit}
              />
            )}
            <ActionTile
              icon={<CopyIcon width={24} height={24} />}
              label="Дублювати"
              onClick={onDuplicate}
            />
            <ActionTile
              icon={<SparklesIcon width={24} height={24} />}
              label="Промпт для ШІ"
              onClick={onOpenAi}
            />
            {onMoveTomorrow && (
              <ActionTile
                icon={<ArrowRightIcon width={24} height={24} />}
                label="На завтра"
                onClick={onMoveTomorrow}
              />
            )}
          </div>
          <div className={styles.divider} />
          <MenuGroup>
          <MenuItem
            icon={<TrashIcon width={22} height={22} />}
            label={labels.remove}
            variant="danger"
            onClick={() => onViewChange('delete')}
          />
          </MenuGroup>
        </>
      )}

      {isDeleting && (
        <div className={styles.confirm}>
          <p className={styles.confirmText}>
            {isRecurring
              ? `Усю серію «${task.title}» буде видалено назавжди, разом з усіма повтореннями.`
              : `«${task.title}» буде видалено назавжди.`}
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" fullWidth onClick={() => onViewChange('menu')}>
              Скасувати
            </Button>
            <Button variant="danger" fullWidth onClick={onDelete}>
              Видалити
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}