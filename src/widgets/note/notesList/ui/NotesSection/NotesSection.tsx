import { NoteCard, formatNotesCount } from '@/entities/note';
import type { Note } from '@/entities/note';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { NotesIcon } from '@/shared/ui/icons';
import styles from './NotesSection.module.css';

interface NotesSectionProps {
  heading: string;
  notes: readonly Note[];
  emptyText: string;
  emptyDescription?: string;
  onCreate?: () => void;
  isSelecting?: boolean;
  selectedIds?: ReadonlySet<string>;
  onOpen?: (note: Note) => void;
  onActions?: (note: Note) => void;
  onLongPress?: (note: Note) => void;
}

export function NotesSection({
  heading,
  notes,
  emptyText,
  emptyDescription,
  onCreate,
  isSelecting = false,
  selectedIds,
  onOpen,
  onActions,
  onLongPress,
}: NotesSectionProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={<NotesIcon filled={false} width={40} height={40} />}
        title={emptyText}
        description={emptyDescription}
        action={onCreate && <Button onClick={onCreate}>Створити нотатку</Button>}
      />
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{heading}</h2>
        <span className={styles.count}>{formatNotesCount(notes.length)}</span>
      </div>
      <ul className={styles.list}>
        {notes.map((note, index) => (
          <li key={note.id}>
            <NoteCard
              note={note}
              hasDivider={index < notes.length - 1}
              isSelecting={isSelecting}
              isSelected={selectedIds?.has(note.id) ?? false}
              onOpen={onOpen}
              onActions={onActions}
              onLongPress={onLongPress}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}