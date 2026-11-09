import { SelectionToolbar, SelectionToolbarButton } from '@/shared/ui/SelectionToolbar';
import { CopyIcon, ScissorsIcon, TrashIcon } from '@/shared/ui/icons';
import type { NoteActionsController } from '../../model/hooks/useNoteActions';
import { NoteActionsSheet } from '../NoteActionsSheet';
import { NoteAiScreen } from '../NoteAiScreen';

interface NoteActionsProps {
  controller: NoteActionsController;
}

export function NoteActions({ controller }: NoteActionsProps) {
  const { selection } = controller;

  return (
    <>
      <NoteActionsSheet
        note={controller.selected}
        isOpen={controller.isMenuOpen}
        onEdit={controller.edit}
        onCopy={controller.copy}
        onCut={controller.cut}
        onDuplicate={() => void controller.duplicate()}
        onSelect={controller.select}
        onImproveWithAi={controller.openAi}
        onExport={controller.exportSelected}
        onDelete={() => void controller.remove()}
        onTogglePin={controller.togglePin}
        onToggleArchive={controller.toggleArchive}
        onClose={controller.closeMenu}
      />
      <NoteAiScreen
        note={controller.selected}
        isOpen={controller.isAiOpen}
        onClose={controller.closeAi}
      />
      {selection.isActive && (
        <SelectionToolbar
          ariaLabel="Дії з вибраними нотатками"
          count={selection.count}
          onCancel={selection.cancel}
        >
          <SelectionToolbarButton label="Копіювати" onClick={selection.copy}>
            <CopyIcon width={22} height={22} />
          </SelectionToolbarButton>
          <SelectionToolbarButton label="Вирізати" onClick={selection.cut}>
            <ScissorsIcon width={22} height={22} />
          </SelectionToolbarButton>
          <SelectionToolbarButton label="Видалити" onClick={() => void selection.remove()}>
            <TrashIcon width={22} height={22} />
          </SelectionToolbarButton>
        </SelectionToolbar>
      )}
    </>
  );
}