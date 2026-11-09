interface NotesTagFilterProps {
  tags: readonly string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}

import styles from './NotesTagFilter.module.css';

export function NotesTagFilter({ tags, activeTag, onSelect }: NotesTagFilterProps) {
  if (tags.length < 2) return null;

  return (
    <div className={styles.filter} role="group" aria-label="Фільтр за тегами">
      <button
        type="button"
        className={styles.chip}
        aria-pressed={activeTag === null}
        onClick={() => onSelect(null)}
      >
        Усі
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={styles.chip}
          aria-pressed={tag === activeTag}
          onClick={() => onSelect(tag === activeTag ? null : tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}