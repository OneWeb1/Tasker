import { NoteScreen, isNoteArchived } from '@/entities/note';
import { NoteFragmentScreen } from '@/features/note/editNoteFragment';
import { useNoteActions } from '../../model/hooks/useNoteActions';
import { useNoteSectionActions } from '../../model/hooks/useNoteSectionActions';
import { useNoteSelectionActions } from '../../model/hooks/useNoteSelectionActions';
import { useNotesBrowser } from '../../model/hooks/useNotesBrowser';
import { NoteActions } from '../NoteActions';
import { NoteAiScreen } from '../NoteAiScreen';
import { NoteSectionActionsSheet } from '../NoteSectionActionsSheet';
import { NoteSectionAiScreen } from '../NoteSectionAiScreen';
import { NotesSection } from '../NotesSection';
import { NotesTagFilter } from '../NotesTagFilter';

export function NotesBrowser() {
  const browser = useNotesBrowser();
  const sections = useNoteSectionActions();
  const selection = useNoteSelectionActions();
  const actions = useNoteActions(browser.notes);
  const isSectionEditable = browser.openedNote !== null && !isNoteArchived(browser.openedNote);
  const isSelecting = actions.selection.isActive;

  return (
    <>
      <NotesTagFilter
        tags={browser.tags}
        activeTag={browser.activeTag}
        onSelect={browser.selectTag}
      />
      <NotesSection
        heading={browser.heading}
        notes={browser.notes}
        emptyText={browser.emptyText}
        isSelecting={isSelecting}
        selectedIds={actions.selection.selectedIds}
        onOpen={isSelecting ? (note) => actions.selection.toggle(note.id) : browser.openNote}
        onActions={isSelecting ? undefined : actions.openMenu}
        onLongPress={isSelecting ? undefined : actions.openMenu}
      />
      <NoteScreen
        note={browser.openedNote}
        isOpen={browser.isNoteOpen}
        onClose={browser.closeNote}
        onSectionAction={isSectionEditable ? sections.openMenu : undefined}
        onSelectionEdit={isSectionEditable ? selection.openEdit : undefined}
        onSelectionAi={isSectionEditable ? selection.openAi : undefined}
      />
      <NoteFragmentScreen
        note={browser.openedNote}
        fragment={selection.fragment}
        isOpen={selection.isEditOpen}
        onClose={selection.closeEdit}
      />
      <NoteAiScreen
        note={browser.openedNote}
        selection={selection.text}
        isOpen={selection.isAiOpen}
        onClose={selection.closeAi}
      />
      <NoteActions controller={actions} />

      <NoteSectionActionsSheet
        isOpen={sections.isMenuOpen}
        onImproveWithAi={sections.openAi}
        onClose={sections.closeMenu}
      />
      <NoteSectionAiScreen
        note={browser.openedNote}
        ordinal={sections.ordinal}
        isOpen={sections.isAiOpen}
        onClose={sections.closeAi}
      />
    </>
  );
}