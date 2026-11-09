interface NoteContentFieldProps {
  value: string;
  onOpen: () => void;
}

import { stripMarkdownDirectives } from '@/shared/lib/utils/markdown';
import styles from './NoteContentField.module.css';

const PLACEHOLDER = 'Контент нотатки…';

export function NoteContentField({ value, onOpen }: NoteContentFieldProps) {
  const text = stripMarkdownDirectives(value).trim();

  return (
    <button
      type="button"
      className={styles.field}
      data-empty={text === '' || undefined}
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <span className={styles.text}>{text || PLACEHOLDER}</span>
    </button>
  );
}