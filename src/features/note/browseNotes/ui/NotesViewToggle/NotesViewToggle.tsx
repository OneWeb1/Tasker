import { NOTES_VIEW_OPTIONS } from '../../model/constants/notesView';
import { useNotesView } from '../../model/hooks/useNotesView';
import styles from './NotesViewToggle.module.css';

export function NotesViewToggle() {
  const { view, setView } = useNotesView();

  return (
    <div className={styles.toggle} role="group" aria-label="Вигляд нотаток">
      {NOTES_VIEW_OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = value === view;

        return (
          <button
            key={value}
            type="button"
            className={styles.option}
            aria-label={label}
            aria-pressed={isActive}
            data-active={isActive || undefined}
            onClick={() => setView(value)}
          >
            <Icon width={20} height={20} />
          </button>
        );
      })}
    </div>
  );
}