import { NoteCard, NoteScreen } from '@/entities/note';
import { IconButton } from '@/shared/ui/IconButton';
import { CloseIcon, PlusIcon } from '@/shared/ui/icons';
import { useTaskNotes } from '../../model/hooks/useTaskNotes';
import { OptionSheet } from '../OptionSheet';
import styles from './TaskNotesSection.module.css';

interface TaskNotesSectionProps {
  taskId: string;
  workspaceId: string;
}

const UNTITLED = 'Без назви';

export function TaskNotesSection({ taskId, workspaceId }: TaskNotesSectionProps) {
  const notes = useTaskNotes(taskId, workspaceId);

  const pickerOptions = notes.candidates.map((note) => ({
    value: note.id,
    label: note.title.trim() || UNTITLED,
  }));

  return (
    <section className={styles.section} aria-label="Нотатки">
      <h2 className={styles.title}>Нотатки</h2>

      {notes.linked.length > 0 && (
        <ul className={styles.list}>
          {notes.linked.map((note, index) => (
            <li key={note.id} className={styles.item}>
              <div className={styles.card}>
                <NoteCard
                  note={note}
                  hasDivider={index > 0}
                  onOpen={() => notes.openNote(note.id)}
                />
              </div>
              <IconButton
                variant="ghost"
                label={`Відв’язати нотатку: ${note.title.trim() || UNTITLED}`}
                onClick={() => notes.unlink(note.id)}
              >
                <CloseIcon width={18} height={18} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      {notes.linked.length === 0 && notes.candidates.length === 0 && (
        <p className={styles.empty}>Немає нотаток для прив’язки</p>
      )}

      {notes.candidates.length > 0 && (
        <button
          type="button"
          className={styles.add}
          aria-haspopup="dialog"
          onClick={notes.openPicker}
        >
          <PlusIcon width={24} height={24} />
          Прив’язати нотатку
        </button>
      )}

      <OptionSheet
        isOpen={notes.isPickerOpen}
        title="Прив’язати нотатку"
        options={pickerOptions}
        value=""
        onSelect={notes.pickNote}
        onClose={notes.closePicker}
      />
      <NoteScreen note={notes.openedNote} isOpen={notes.isNoteOpen} onClose={notes.closeNote} />
    </section>

  );
}