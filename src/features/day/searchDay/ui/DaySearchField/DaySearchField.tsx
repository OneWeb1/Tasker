import { useRef } from 'react';
import { CloseIcon, SearchIcon } from '@/shared/ui/icons';
import { useDaySearch } from '../../model/hooks/useDaySearch';
import styles from './DaySearchField.module.css';

interface DaySearchFieldProps {
  onSubmit: () => void;
}

export function DaySearchField({ onSubmit }: DaySearchFieldProps) {
  const { query, setQuery, clearQuery } = useDaySearch();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className={styles.field}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        inputRef.current?.blur();
        onSubmit();
      }}
    >
      <SearchIcon className={styles.icon} width={20} height={20} />
      <input
        ref={inputRef}
        type="text"
        enterKeyHint="search"
        className={styles.input}
        value={query}
        placeholder="Пошук"
        aria-label="Пошук"
        onChange={(event) => setQuery(event.target.value)}
      />
      {query !== '' && (
        <button type="button" className={styles.clear} aria-label="Очистити пошук" onClick={clearQuery}>
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </form>
  );
}