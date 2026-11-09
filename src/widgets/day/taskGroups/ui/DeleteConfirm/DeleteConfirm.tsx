import { Button } from '@/shared/ui/Button';
import styles from './DeleteConfirm.module.css';

interface DeleteConfirmProps {
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirm({ text, onCancel, onConfirm }: DeleteConfirmProps) {
  return (
    <div className={styles.confirm}>
      <p className={styles.text}>{text}</p>
      <div className={styles.actions}>
        <Button variant="ghost" fullWidth onClick={onCancel}>
          Скасувати
        </Button>
        <Button variant="danger" fullWidth onClick={onConfirm}>
          Видалити
        </Button>
      </div>
    </div>
  );
}