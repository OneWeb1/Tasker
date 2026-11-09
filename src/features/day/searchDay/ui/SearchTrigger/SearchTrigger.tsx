import { SearchIcon } from '@/shared/ui/icons';
import { useSearchScreen } from '../../model/hooks/useSearchScreen';
import styles from './SearchTrigger.module.css';

export function SearchTrigger() {
  const { open } = useSearchScreen();

  return (
    <button type="button" className={styles.trigger} aria-haspopup="dialog" onClick={open}>
      <SearchIcon className={styles.icon} width={20} height={20} />
      <span>Пошук</span>
    </button>
  );
}