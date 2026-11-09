import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { useToast } from '@/shared/ui/Toast';
import { PasteIcon, PlusIcon } from '@/shared/ui/icons';
import { useNoteClipboard } from '../../model/hooks/useNoteClipboard';

interface NotesMenuSheetProps {
  isOpen: boolean;
  workspaceId: string;
  dateKey?: string;
  onCreate?: () => void;
  onClose: () => void;
}

export function NotesMenuSheet({
  isOpen,
  workspaceId,
  dateKey,
  onCreate,
  onClose,
}: NotesMenuSheetProps) {
  const { clipboardCount, pasteNotes } = useNoteClipboard();
  const { showToast } = useToast();

  const handlePaste = async () => {
    onClose();
    const result = await pasteNotes(workspaceId, dateKey);
    if (!result) {
      showToast({ message: 'Не вдалося вставити нотатки' });
      return;
    }
    showToast({
      message: `${result.mode === 'copy' ? 'Вставлено' : 'Переміщено'}: ${result.count}`,
      actionLabel: 'Відмінити',
      onAction: result.undo,
    });
  };

  return (
    <BottomSheet isOpen={isOpen} title="Нотатки" onClose={onClose}>
      <MenuGroup>
      {onCreate && (
        <MenuItem
          icon={<PlusIcon width={22} height={22} />}
          label="Нова нотатка"
          onClick={() => {
            onClose();
            onCreate();
          }}
        />
      )}
      {clipboardCount > 0 && (
        <MenuItem
          icon={<PasteIcon width={22} height={22} />}
          label={`Вставити (${clipboardCount})`}
          onClick={() => void handlePaste()}
        />
      )}
      </MenuGroup>
    </BottomSheet>
  );
}