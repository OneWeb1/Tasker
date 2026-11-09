import type { NoteSearchEntry } from '@/entities/note';
import { NotesIcon } from '@/shared/ui/icons';
import styles from './SearchNoteRow.module.css';

interface SearchNoteRowProps {
  entry: NoteSearchEntry;
  onOpen: (entry: NoteSearchEntry) => void;
}

export function SearchNoteRow({ entry, onOpen }: SearchNoteRowProps) {
  return (
    <li>
      <button type="button" className={styles.row} onClick={() => onOpen(entry)}>
        <span className={styles.icon} aria-hidden="true">
          <NotesIcon width={26} height={26} />
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{entry.title}</span>
          {entry.content && <span className={styles.content}>{entry.content}</span>}
        </span>
      </button>
    </li>
  );
}