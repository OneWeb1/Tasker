import { ActionTile } from '@/shared/ui/ActionTile';
import { ActionTileBar } from '@/shared/ui/ActionTileBar';
import { CheckIcon, CopyIcon, RestoreIcon, SelectIcon, TrashIcon } from '@/shared/ui/icons';

interface SubtaskActionsBarProps {
  count: number;
  isMulti: boolean;
  isAllDone: boolean;
  onToggleDone: () => void;
  onDuplicate: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function SubtaskActionsBar({
  count,
  isMulti,
  isAllDone,
  onToggleDone,
  onDuplicate,
  onSelect,
  onDelete,
  onCancel,
}: SubtaskActionsBarProps) {
  const isEmpty = count === 0;

  return (
    <ActionTileBar
      ariaLabel="Дії з підзавданнями"
      header={isMulti ? { title: `Вибрано: ${count}`, onCancel } : undefined}
    >
      <ActionTile
        icon={
          isAllDone ? <RestoreIcon width={24} height={24} /> : <CheckIcon width={24} height={24} />
        }
        label={isAllDone ? 'Відкрити' : 'Виконано'}
        disabled={isEmpty}
        onClick={onToggleDone}
      />
      <ActionTile
        icon={<CopyIcon width={24} height={24} />}
        label="Дублювати"
        disabled={isEmpty}
        onClick={onDuplicate}
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
        disabled={isEmpty}
        onClick={onDelete}
      />
    </ActionTileBar>
  );
}