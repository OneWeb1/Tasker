import type { FocusEvent, KeyboardEvent, ReactNode } from 'react';
import styles from './NoteAttachmentGroup.module.css';

const TITLE_MAX_LENGTH = 60;

interface NoteAttachmentGroupProps {
  id: string | null;
  title: string;
  onRename?: (groupId: string, title: string) => void;
  children: ReactNode;
}

export function NoteAttachmentGroup({ id, title, onRename, children }: NoteAttachmentGroupProps) {
  const isEditable = onRename !== undefined && id !== null;

  const commit = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.currentTarget.value.trim();
    if (id !== null && next !== title) onRename?.(id, next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <section className={styles.group}>
      {isEditable ? (
        <input
          key={title}
          className={styles.input}
          type="text"
          defaultValue={title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="Назва групи"
          aria-label="Назва групи вкладень"
          enterKeyHint="done"
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        title !== '' && <h3 className={styles.title}>{title}</h3>
      )}
      {children}
    </section>
  );
}