import { CreateNoteRow } from '@/features/createItem';
import { NotesBrowser } from '@/widgets/note/notesList';
import styles from './NotesPage.module.css';

export function NotesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <NotesBrowser />
      </div>
      <CreateNoteRow />
    </div>
  );
}