import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import styles from './ChecklistDeleteSheet.module.css';

interface ChecklistDeleteSheetProps {
  isOpen: boolean;
  text: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ChecklistDeleteSheet({ isOpen, text, onClose, onConfirm }: ChecklistDeleteSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Видалити чекліст?" onClose={onClose}>
      <div className={styles.confirm}>
        <p className={styles.text}>{text}</p>
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