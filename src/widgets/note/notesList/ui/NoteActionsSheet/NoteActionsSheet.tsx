import { isNoteArchived, isNotePinned } from '@/entities/note';
import type { Note } from '@/entities/note';
import { ActionTile } from '@/shared/ui/ActionTile';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  NotesIcon,
  PinIcon,
  RestoreIcon,
  ScissorsIcon,
  SelectIcon,
  SparklesIcon,
  TrashIcon,
} from '@/shared/ui/icons';
import styles from './NoteActionsSheet.module.css';

const UNTITLED = 'Без назви';

interface NoteActionsSheetProps {
  note: Note | null;
  isOpen: boolean;
  onEdit: () => void;
  onCopy: () => void;
  onCut: () => void;
  onDuplicate: () => void;
  onSelect: () => void;
  onImproveWithAi: () => void;
  onExport: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onClose: () => void;
}

export function NoteActionsSheet({
  note,
  isOpen,
  onEdit,
  onCopy,
  onCut,
  onDuplicate,
  onSelect,
  onImproveWithAi,
  onExport,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onClose,
}: NoteActionsSheetProps) {
  const isArchived = note !== null && isNoteArchived(note);
  const isPinned = note !== null && isNotePinned(note);
  const title = note?.title.trim() || UNTITLED;
  const tags = note?.tags ?? [];

  return (
    <BottomSheet
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      header={
        note ? (
          <SheetHeader
            icon={<NotesIcon width={22} height={22} />}
            title={title}
            subtitle={tags.length > 0 ? tags.map((tag) => `#${tag}`).join(' ') : undefined}
            onClose={onClose}
          />
        ) : undefined
      }
    >
      {note && (
        <>
          <div className={styles.tiles}>
            <ActionTile
              icon={<EditIcon width={24} height={24} />}
              label="Редагувати"
              onClick={onEdit}
            />
            <ActionTile
              icon={<CopyIcon width={24} height={24} />}
              label="Копіювати"
              onClick={onCopy}
            />
            <ActionTile
              icon={<ScissorsIcon width={24} height={24} />}
              label="Вирізати"
              onClick={onCut}
            />
            <ActionTile
              icon={<NotesIcon filled={false} width={24} height={24} />}
              label="Дублювати"
              onClick={onDuplicate}
            />
            <ActionTile
              icon={<SelectIcon width={24} height={24} />}
              label="Вибрати"
              onClick={onSelect}
            />
          </div>
          <div className={styles.divider} />
          <MenuGroup>
          <MenuItem
            icon={<DownloadIcon width={22} height={22} />}
            label="Експортувати в Markdown"
            onClick={onExport}
          />
          {!isArchived && (
            <MenuItem
              icon={<SparklesIcon width={22} height={22} />}
              label="Покращити через ШІ"
              onClick={onImproveWithAi}
            />
          )}
          {!isArchived && (
            <MenuItem
              icon={<PinIcon width={22} height={22} />}
              label={isPinned ? 'Відкріпити' : 'Закріпити'}
              onClick={onTogglePin}
            />
          )}
          <MenuItem
            icon={
              isArchived ? (
                <RestoreIcon width={22} height={22} />
              ) : (
                <ArchiveIcon width={22} height={22} />
              )
            }
            label={isArchived ? 'Повернути з архіву' : 'В архів'}
            onClick={onToggleArchive}
          />
          <MenuItem
            icon={<TrashIcon width={22} height={22} />}
            label="Видалити"
            variant="danger"
            onClick={onDelete}
          />
          </MenuGroup>
        </>
      )}
    </BottomSheet>
  );
}