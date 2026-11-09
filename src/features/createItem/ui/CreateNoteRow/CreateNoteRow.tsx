import { PlusIcon } from '@/shared/ui/icons';
import { useCreateItem } from '../../model/hooks/useCreateItem';
import styles from './CreateNoteRow.module.css';

export function CreateNoteRow() {
  const { open } = useCreateItem();

  return (
    <div className={styles.dock}>
      <button type="button" className={styles.row} onClick={() => open({ kind: 'note' })}>
        <span className={styles.icon} aria-hidden="true">
          <PlusIcon width={26} height={26} />
        </span>
        <span className={styles.title}>Нова нотатка</span>
      </button>
    </div>
  );
}