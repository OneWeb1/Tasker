import { NoteScreen } from '@/entities/note';
import { useCreateItem } from '@/features/createItem';
import { useNoteActions } from '../../model/hooks/useNoteActions';
import { useNotesList } from '../../model/hooks/useNotesList';
import { NoteActions } from '../NoteActions';
import { NotesSection } from '../NotesSection';

export function NotesList() {
  const { notes, sectionLabel, openedNote, isNoteOpen, openNote, closeNote } = useNotesList();
  const { open: openCreateItem } = useCreateItem();
  const actions = useNoteActions(notes);
  const isSelecting = actions.selection.isActive;

  return (
    <>
      <NotesSection
        heading={sectionLabel}
        notes={notes}
        emptyText="Нотаток немає"
        emptyDescription="На цей день ще немає жодної нотатки. Створіть першу, щоб нічого не загубити."
        onCreate={() => openCreateItem({ kind: 'note' })}
        isSelecting={isSelecting}
        selectedIds={actions.selection.selectedIds}
        onOpen={isSelecting ? (note) => actions.selection.toggle(note.id) : openNote}
        onLongPress={isSelecting ? undefined : actions.openMenu}
      />
      <NoteActions controller={actions} />
      <NoteScreen note={openedNote} isOpen={isNoteOpen} onClose={closeNote} />
    </>
  );
}