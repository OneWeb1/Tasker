import { SelectionToolbar, SelectionToolbarButton } from '@/shared/ui/SelectionToolbar';
import { DownloadIcon, TrashIcon } from '@/shared/ui/icons';

interface AttachmentSelectionBarProps {
  count: number;
  onDownload: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function AttachmentSelectionBar({
  count,
  onDownload,
  onDelete,
  onCancel,
}: AttachmentSelectionBarProps) {
  const isEmpty = count === 0;

  return (
    <SelectionToolbar ariaLabel="Дії з вибраними вкладеннями" count={count} onCancel={onCancel}>
      <SelectionToolbarButton label="Завантажити вибрані" disabled={isEmpty} onClick={onDownload}>
        <DownloadIcon width={22} height={22} />
      </SelectionToolbarButton>
      <SelectionToolbarButton
        label="Видалити вибрані"
        variant="danger"
        disabled={isEmpty}
        onClick={onDelete}
      >
        <TrashIcon width={22} height={22} />
      </SelectionToolbarButton>
    </SelectionToolbar>
  );
}