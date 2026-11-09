import { PlusIcon } from '@/shared/ui/icons';
import styles from './NavFab.module.css';

interface NavFabProps {
  label: string;
  onClick: () => void;
}

export function NavFab({ label, onClick }: NavFabProps) {
  return (
    <button type="button" className={styles.fab} aria-label={label} onClick={onClick}>
      <PlusIcon />
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
    </button>
  );
}