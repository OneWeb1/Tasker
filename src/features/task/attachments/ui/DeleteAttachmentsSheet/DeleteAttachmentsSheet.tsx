import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import styles from './DeleteAttachmentsSheet.module.css';

interface DeleteAttachmentsSheetProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAttachmentsSheet({
  isOpen,
  count,
  onClose,
  onConfirm,
}: DeleteAttachmentsSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      title={count > 1 ? 'Видалити вкладення?' : 'Видалити вкладення?'}
      onClose={onClose}
    >
      <div className={styles.confirm}>
        <p className={styles.text}>
          {count > 1
            ? `Вибрані вкладення (${count}) буде видалено назавжди.`
            : 'Вкладення буде видалено назавжди.'}
        </p>
        <div className={styles.actions}>
          <Button variant="ghost" fullWidth onClick={onClose}>
            Скасувати
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>
            Видалити
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}