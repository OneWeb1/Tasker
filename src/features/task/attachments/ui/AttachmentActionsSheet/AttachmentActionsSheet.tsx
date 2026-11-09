import type { TaskAttachment } from '@/entities/task';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { DownloadIcon, SelectIcon, TrashIcon } from '@/shared/ui/icons';

interface AttachmentActionsSheetProps {
  attachment: TaskAttachment;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onSelect: () => void;
  onDelete: () => void;
}

export function AttachmentActionsSheet({
  attachment,
  isOpen,
  onClose,
  onDownload,
  onSelect,
  onDelete,
}: AttachmentActionsSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title={attachment.name} onClose={onClose}>
      <MenuGroup>
      <MenuItem
        icon={<DownloadIcon width={22} height={22} />}
        label="Завантажити"
        onClick={onDownload}
      />
      <MenuItem icon={<SelectIcon width={22} height={22} />} label="Вибрати" onClick={onSelect} />
      <MenuItem
        icon={<TrashIcon width={22} height={22} />}
        label="Видалити"
        variant="danger"
        onClick={onDelete}
      />
      </MenuGroup>
    </BottomSheet>
  );
}