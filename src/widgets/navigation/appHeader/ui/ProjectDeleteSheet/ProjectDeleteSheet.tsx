import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import styles from './ProjectDeleteSheet.module.css';

interface ProjectDeleteSheetProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function ProjectDeleteSheet({ isOpen, count, onClose, onConfirm }: ProjectDeleteSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      title={count === 1 ? 'Видалити проєкт?' : 'Видалити проєкти?'}
      onClose={onClose}
    >
      <div className={styles.confirm}>
        <p className={styles.text}>
          Завдання залишаться, але більше не належатимуть до видаленого проєкту. Дію можна
          відмінити одразу після видалення.
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