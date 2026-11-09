import { ActionTile } from '@/shared/ui/ActionTile';
import { ActionTileBar } from '@/shared/ui/ActionTileBar';
import { EditIcon, ListIcon, SelectIcon, TrashIcon } from '@/shared/ui/icons';

interface ChecklistActionsBarProps {
  count: number;
  isMulti: boolean;
  onEdit: () => void;
  onRename: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function ChecklistActionsBar({
  count,
  isMulti,
  onEdit,
  onRename,
  onSelect,
  onDelete,
  onCancel,
}: ChecklistActionsBarProps) {
  const isSingle = count === 1;

  return (
    <ActionTileBar
      ariaLabel="Дії з чеклістами"
      header={isMulti ? { title: `Вибрано: ${count}`, onCancel } : undefined}
    >
      <ActionTile
        icon={<ListIcon width={24} height={24} />}
        label="Редагувати"
        disabled={!isSingle}
        onClick={onEdit}
      />
      <ActionTile
        icon={<EditIcon width={24} height={24} />}
        label="Змінити назву"
        disabled={!isSingle}
        onClick={onRename}
      />
      <ActionTile
        icon={<SelectIcon width={24} height={24} />}
        label="Вибрати"
        disabled={isMulti}
        onClick={onSelect}
      />
      <ActionTile
        icon={<TrashIcon width={24} height={24} />}
        label="Видалити"
        variant="danger"
        disabled={count === 0}
        onClick={onDelete}
      />
    </ActionTileBar>
  );
}