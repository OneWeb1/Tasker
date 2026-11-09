import { stripMarkdownDirectives } from '@/shared/lib/utils/markdown';
import type { CSSProperties } from 'react';
import { useLongPress } from '@/shared/lib/hooks/useLongPress';
import { CheckIcon, MoreIcon, NotesIcon, PinIcon } from '@/shared/ui/icons';
import { isNotePinned } from '../../lib/notePin';
import type { Note } from '../../model/types/note';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: Note;
  hasDivider?: boolean;
  isSelecting?: boolean;
  isSelected?: boolean;
  onOpen?: (note: Note) => void;
  onActions?: (note: Note) => void;
  onLongPress?: (note: Note) => void;
}

const UNTITLED = 'Без назви';
const EMPTY_PREVIEW = 'Порожня нотатка';

const formatUpdatedAt = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });

export function NoteCard({
  note,
  hasDivider = false,
  isSelecting = false,
  isSelected = false,
  onOpen,
  onActions,
  onLongPress,
}: NoteCardProps) {
  const longPress = useLongPress({ onLongPress: () => onLongPress?.(note) });
  const title = note.title.trim() || UNTITLED;
  const content = stripMarkdownDirectives(note.content).trim();
  const tags = note.tags ?? [];

  return (
    <article
      className={styles.row}
      data-divider={hasDivider || undefined}
      data-selected={isSelected || undefined}
      data-colored={note.color ? true : undefined}
      style={note.color ? ({ '--note-accent': note.color } as CSSProperties) : undefined}
    >
      <span className={styles.icon} aria-hidden="true">
        {isSelecting ? (
          <span className={styles.check} data-checked={isSelected || undefined}>
            {isSelected && <CheckIcon width={14} height={14} />}
          </span>
        ) : (
          <NotesIcon width={26} height={26} />
        )}
      </span>
      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.titleRow}>
            {isNotePinned(note) && (
              <span className={styles.pin} role="img" aria-label="Закріплено">
                <PinIcon width={14} height={14} />
              </span>
            )}
            <h3 className={styles.title}>{title}</h3>
          </div>
          <time className={styles.date} dateTime={new Date(note.updatedAt).toISOString()}>
            {formatUpdatedAt(note.updatedAt)}
          </time>
        </div>
        <p className={styles.preview} data-empty={content === '' || undefined}>
          {content || EMPTY_PREVIEW}
        </p>
        {tags.length > 0 && <p className={styles.tags}>{tags.map((tag) => `#${tag}`).join(' ')}</p>}
      </div>
      {onActions && (
        <button
          type="button"
          className={styles.more}
          aria-label={`Дії з нотаткою: ${title}`}
          onClick={() => onActions(note)}
        >
          <MoreIcon width={22} height={22} />
        </button>
      )}
      {onOpen && (
        <button
          type="button"
          className={styles.hit}
          aria-label={`Відкрити нотатку: ${title}`}
          aria-pressed={isSelecting ? isSelected : undefined}
          onClick={() => onOpen(note)}
          {...(onLongPress ? longPress : {})}
        />
      )}
    </article>
  );
}