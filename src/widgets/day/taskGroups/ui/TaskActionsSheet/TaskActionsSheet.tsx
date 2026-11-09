import type { Category } from '@/entities/category';
import type { Task } from '@/entities/task';
import { ActionTile } from '@/shared/ui/ActionTile';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import {
  ArrowRightIcon,
  CopyIcon,
  EditIcon,
  PostponeIcon,
  RestoreIcon,
  SelectIcon,
  TrashIcon,
} from '@/shared/ui/icons';
import type { TaskSheetView } from '../../model/hooks/useTaskGroups';
import { DeleteConfirm } from '../DeleteConfirm';
import styles from './TaskActionsSheet.module.css';

interface TaskActionsSheetProps {
  task: Task | null;
  category: Category | undefined;
  isOpen: boolean;
  view: TaskSheetView;
  isRecurring: boolean;
  isDone: boolean;
  isMovable: boolean;
  onClose: () => void;
  onViewChange: (view: TaskSheetView) => void;
  onPostpone: () => void;
  onRestore: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onMoveTomorrow: () => void;
  onSelect: () => void;
  onDelete: () => void;
}

const getTimeLabel = (task: Task): string => {
  if (!task.startTime) return 'Без часу';
  return task.endTime ? `${task.startTime}–${task.endTime}` : task.startTime;
};

export function TaskActionsSheet({
  task,
  category,
  isOpen,
  view,
  isRecurring,
  isDone,
  isMovable,
  onClose,
  onViewChange,
  onPostpone,
  onRestore,
  onEdit,
  onDuplicate,
  onMoveTomorrow,
  onSelect,
  onDelete,
}: TaskActionsSheetProps) {
  const title = view === 'delete' ? 'Видалити завдання?' : (task?.title ?? '');
  const isPostponed = task?.status === 'postponed';
  const subtitle = task
    ? [category?.title, getTimeLabel(task), isRecurring ? 'Повторюване' : null]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <BottomSheet
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      header={
        task && view === 'menu' ? (
          <SheetHeader
            icon={category?.emoji ?? '•'}
            color={category?.color}
            title={task.title}
            subtitle={subtitle}
            onClose={onClose}
          />
        ) : undefined
      }
    >
      {task && view === 'menu' && (
        <>
          <div className={styles.tiles}>
            <ActionTile
              icon={<EditIcon width={24} height={24} />}
              label="Редагувати"
              onClick={onEdit}
            />
            {!isPostponed && (
              <ActionTile
                icon={<CopyIcon width={24} height={24} />}
                label="Дублювати"
                onClick={onDuplicate}
              />
            )}
            {!isPostponed && isMovable && (
              <ActionTile
                icon={<ArrowRightIcon width={24} height={24} />}
                label="На завтра"
                onClick={onMoveTomorrow}
              />
            )}
            {isPostponed ? (
              <ActionTile
                icon={<RestoreIcon width={24} height={24} />}
                label="Повернути"
                onClick={onRestore}
              />
            ) : (
              !isDone && (
                <ActionTile
                  icon={<PostponeIcon width={24} height={24} />}
                  label={isRecurring ? 'Пропустити' : 'Відкласти'}
                  onClick={onPostpone}
                />
              )
            )}
            {!isPostponed && (
              <ActionTile
                icon={<SelectIcon width={24} height={24} />}
                label="Вибрати"
                onClick={onSelect}
              />
            )}
          </div>
          <div className={styles.divider} />
          <MenuGroup>
          <MenuItem
            icon={<TrashIcon width={22} height={22} />}
            label="Видалити завдання"
            variant="danger"
            onClick={() => onViewChange('delete')}
          />
          </MenuGroup>
        </>
      )}

      {task && view === 'delete' && (
        <DeleteConfirm
          text={
            isRecurring
              ? `Усю серію «${task.title}» буде видалено назавжди, разом з усіма повтореннями.`
              : `«${task.title}» буде видалено назавжди.`
          }
          onCancel={() => onViewChange('menu')}
          onConfirm={onDelete}
        />
      )}
    </BottomSheet>
  );
}