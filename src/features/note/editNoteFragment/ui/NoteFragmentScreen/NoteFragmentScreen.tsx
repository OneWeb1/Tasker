import { useLayoutEffect, useState } from 'react';
import type { Note, NoteFragment } from '@/entities/note';
import { EditableText } from '@/shared/ui/EditableText';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { FRAGMENT_FOCUS_DELAY_MS } from '../../model/constants/noteFragment';
import { useEditNoteFragment } from '../../model/hooks/useEditNoteFragment';
import styles from './NoteFragmentScreen.module.css';

const TITLE = 'Редагування фрагмента';

interface NoteFragmentEditorProps {
  note: Note;
  fragment: NoteFragment;
  isOpen: boolean;
  onClose: () => void;
}

function NoteFragmentEditor({ note, fragment, isOpen, onClose }: NoteFragmentEditorProps) {
  const [draft, setDraft] = useState(fragment.text);
  const { error, isSubmitting, save, clearError } = useEditNoteFragment(note, fragment, onClose);

  useLayoutEffect(() => {
    if (!isOpen) return;
    setDraft(fragment.text);
    clearError();
  }, [isOpen, fragment, clearError]);

  return (
    <SlideScreen
      isOpen={isOpen}
      title={TITLE}
      isHeaderPlain
      action={
        <button
          type="button"
          className={styles.save}
          disabled={isSubmitting}
          onClick={() => void save(draft.trim())}
        >
          Зберегти
        </button>
      }
      onClose={onClose}
    >
      <div className={styles.body}>
        <EditableText
          value={draft}
          label="Фрагмент нотатки"
          variant="description"
          placeholder="Порожньо — фрагмент буде видалено"
          autoFocusDelay={FRAGMENT_FOCUS_DELAY_MS}
          onChange={(next) => {
            setDraft(next);
            clearError();
          }}
          onSave={setDraft}
        />
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </SlideScreen>
  );
}

interface NoteFragmentScreenProps {
  note: Note | null;
  fragment: NoteFragment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteFragmentScreen({ note, fragment, isOpen, onClose }: NoteFragmentScreenProps) {
  if (!note || !fragment) return null;
  return <NoteFragmentEditor note={note} fragment={fragment} isOpen={isOpen} onClose={onClose} />;
}