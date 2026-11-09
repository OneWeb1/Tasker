import { useState } from 'react';
import { useTaskDiff } from '@/entities/task';
import type { Task } from '@/entities/task';
import { useItemSelection } from '@/shared/lib/hooks/useItemSelection';
import { PlusIcon } from '@/shared/ui/icons';
import { useChecklists } from '../../model/hooks/useChecklists';
import { ChecklistActionsBar } from '../ChecklistActionsBar';
import { ChecklistDeleteSheet } from '../ChecklistDeleteSheet';
import { ChecklistRenameSheet } from '../ChecklistRenameSheet';
import { ChecklistsScreen } from '../ChecklistsScreen';
import { ChecklistCard } from './ChecklistCard';
import { ChecklistsView } from './ChecklistsView';
import styles from './ChecklistsSection.module.css';

interface ChecklistsSectionProps {
  task: Task;
}

type SheetTarget = { kind: 'rename'; id: string } | { kind: 'delete'; ids: readonly string[] };

export function ChecklistsSection({ task }: ChecklistsSectionProps) {
  const { checklists, addChecklist, renameChecklist, removeChecklists } = useChecklists(task);
  const selection = useItemSelection();
  const isReadOnly = useTaskDiff() !== null;
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [autoAddId, setAutoAddId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [selectedId] = selection.ids;

  const open = (id: string | null) => {
    setActiveId(id);
    setIsOpen(true);
  };

  const createChecklist = () => {
    const id = addChecklist();
    setAutoAddId(id);
    open(id);
  };

  const showSheet = (target: SheetTarget) => {
    selection.clear();
    setSheet(target);
    setIsSheetOpen(true);
  };

  const closeSheet = () => setIsSheetOpen(false);

  const handleCardClick = (id: string) => {
    if (!selection.isActive) open(id);
    else if (selection.isMulti) selection.pick(id);
    else selection.clear();
  };

  const handleEdit = () => {
    if (selectedId === undefined) return;
    selection.clear();
    open(selectedId);
  };

  const handleRename = () => {
    if (selectedId !== undefined) showSheet({ kind: 'rename', id: selectedId });
  };

  const renameTarget =
    sheet?.kind === 'rename' ? checklists.find((checklist) => checklist.id === sheet.id) : undefined;

  const deleteIds = sheet?.kind === 'delete' ? sheet.ids : [];
  const deleteTitles = checklists
    .filter((checklist) => deleteIds.includes(checklist.id))
    .map((checklist) => checklist.title);
  const deleteText =
    deleteTitles.length === 1
      ? `«${deleteTitles[0]}» буде видалено разом з усіма пунктами.`
      : 'Вибрані чеклісти буде видалено разом з усіма пунктами.';

  return (
    <ChecklistsView
      onOpenAll={checklists.length > 0 ? () => open(null) : undefined}
      cards={
        checklists.length > 0
          ? checklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                isSelected={selection.selectedIds.has(checklist.id)}
                isSelecting={selection.isActive}
                onClick={() => handleCardClick(checklist.id)}
                onLongPress={isReadOnly ? undefined : () => selection.pick(checklist.id)}
              />
            ))
          : null
      }
    >
      {!isReadOnly && (
        <button type="button" className={styles.add} onClick={createChecklist}>
          <PlusIcon width={24} height={24} />
          Додати чекліст
        </button>
      )}

      {selection.isActive && (
        <ChecklistActionsBar
          count={selection.count}
          isMulti={selection.isMulti}
          onEdit={handleEdit}
          onRename={handleRename}
          onSelect={selection.startMulti}
          onDelete={() => showSheet({ kind: 'delete', ids: selection.ids })}
          onCancel={selection.clear}
        />
      )}

      <ChecklistRenameSheet
        isOpen={isSheetOpen && sheet?.kind === 'rename'}
        initialTitle={renameTarget?.title ?? ''}
        onClose={closeSheet}
        onSubmit={(title) => {
          if (renameTarget) renameChecklist(renameTarget.id, title);
          closeSheet();
        }}
      />

      <ChecklistDeleteSheet
        isOpen={isSheetOpen && sheet?.kind === 'delete'}
        text={deleteText}
        onClose={closeSheet}
        onConfirm={() => {
          removeChecklists(deleteIds);
          closeSheet();
        }}
      />

      <ChecklistsScreen
        task={task}
        isOpen={isOpen}
        activeId={activeId}
        autoAddId={autoAddId}
        onActiveChange={setActiveId}
        onAutoAddChange={setAutoAddId}
        onClose={() => setIsOpen(false)}
      />
    </ChecklistsView>

  );
}