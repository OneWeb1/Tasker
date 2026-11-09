import type { TaskComment } from '@/entities/task';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { CopyIcon, EditIcon, TrashIcon } from '@/shared/ui/icons';
import type { CommentSheetView } from '../../model/hooks/useCommentActions';
import styles from './CommentActionsSheet.module.css';

interface CommentActionsSheetProps {
  comment: TaskComment | null;
  isOpen: boolean;
  view: CommentSheetView;
  onClose: () => void;
  onViewChange: (view: CommentSheetView) => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TITLES: Record<CommentSheetView, string> = {
  menu: 'Коментар',
  delete: 'Видалити коментар?',
};

export function CommentActionsSheet({
  comment,
  isOpen,
  view,
  onClose,
  onViewChange,
  onCopy,
  onEdit,
  onDelete,
}: CommentActionsSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      title={TITLES[view]}
      onClose={onClose}
      onBack={view === 'menu' ? undefined : () => onViewChange('menu')}
    >
      {comment && view === 'menu' && (
        <>
          <MenuGroup>
          <MenuItem
            icon={<EditIcon width={22} height={22} />}
            label="Редагувати"
            onClick={onEdit}
          />
          <MenuItem
            icon={<CopyIcon width={22} height={22} />}
            label="Копіювати текст"
            onClick={onCopy}
          />
          <MenuItem
            icon={<TrashIcon width={22} height={22} />}
            label="Видалити"
            variant="danger"
            onClick={() => onViewChange('delete')}
          />
          </MenuGroup>
        </>
      )}

      {comment && view === 'delete' && (
        <div className={styles.confirm}>
          <p className={styles.confirmText}>Коментар буде видалено назавжди.</p>
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