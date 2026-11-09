import { ActionTile } from '@/shared/ui/ActionTile';
import { ActionTileBar } from '@/shared/ui/ActionTileBar';
import { EditIcon, PlusIcon, SelectIcon, TrashIcon } from '@/shared/ui/icons';

interface ChecklistItemActionsBarProps {
  count: number;
  isMulti: boolean;
  onAddSubItem: () => void;
  onRename: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function ChecklistItemActionsBar({
  count,
  isMulti,
  onAddSubItem,
  onRename,
  onSelect,
  onDelete,
  onCancel,
}: ChecklistItemActionsBarProps) {
  const isSingle = count === 1;

  return (
    <ActionTileBar
      ariaLabel="Дії з пунктами"
      header={isMulti ? { title: `Вибрано: ${count}`, onCancel } : undefined}
    >
      <ActionTile
        icon={<PlusIcon width={24} height={24} />}
        label="Підпункт"
        disabled={!isSingle}
        onClick={onAddSubItem}
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