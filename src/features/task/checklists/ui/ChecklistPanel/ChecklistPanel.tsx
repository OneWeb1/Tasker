import { useEffect, useState } from 'react';
import { getChecklistProgress, useDiffKind, useTaskDiff } from '@/entities/task';
import type { Task, TaskChecklist } from '@/entities/task';
import { DiffSign } from '@/shared/ui/DiffSign';
import {
  CHECKLIST_AUTO_ADD_DELAY_MS,
  CHECKLIST_TITLE_MAX_LENGTH,
} from '../../model/constants/checklist';
import { useChecklistItemSelection } from '../../model/hooks/useChecklistItemSelection';
import { useChecklists } from '../../model/hooks/useChecklists';
import { useCollapsedItems } from '../../model/hooks/useCollapsedItems';
import { ChecklistHeading } from '../ChecklistHeading';
import { ChecklistItemActionsBar } from '../ChecklistItemActionsBar';
import { ChecklistTree } from '../ChecklistTree';
import styles from './ChecklistPanel.module.css';

interface ChecklistPanelProps {
  task: Task;
  checklist: TaskChecklist;
  autoAdd?: boolean;
  onAutoAdded?: () => void;
}

export function ChecklistPanel({
  task,
  checklist,
  autoAdd = false,
  onAutoAdded,
}: ChecklistPanelProps) {
  const { renameChecklist, addItem, addSubItem, renameItem, toggleItem, removeItems } =
    useChecklists(task);
  const selection = useChecklistItemSelection();
  const { collapsedIds, toggle: toggleExpand, expand } = useCollapsedItems();
  const [draft, setDraft] = useState(checklist.title);
  const progress = getChecklistProgress(checklist);
  const isReadOnly = useTaskDiff() !== null;
  const kind = useDiffKind(checklist.id);
  const { startAdd } = selection;

  useEffect(() => {
    if (!autoAdd) return;
    const timer = window.setTimeout(() => {
      startAdd(null);
      onAutoAdded?.();
    }, CHECKLIST_AUTO_ADD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoAdd, onAutoAdded, startAdd]);

  const commitTitle = () => {
    const next = draft.trim();
    if (!next) {
      setDraft(checklist.title);
      return;
    }
    setDraft(next);
    if (next !== checklist.title) renameChecklist(checklist.id, next);
  };

  const handleAdd = (parentId: string | null, title: string) => {
    if (parentId === null) addItem(checklist.id, title);
    else addSubItem(checklist.id, parentId, title);
  };

  const handleAddSubItem = () => {
    const [parentId] = selection.ids;
    if (parentId === undefined) return;
    expand(parentId);
    selection.startAdd(parentId);
  };

  const handleDeleteItems = () => {
    removeItems(checklist.id, selection.ids);
    selection.reset();
  };

  return (
    <div className={styles.panel} data-diff={kind}>
      <DiffSign kind={kind} />
      <ChecklistHeading done={progress.done} total={progress.total}>
        <input
          className={styles.title}
          value={draft}
          maxLength={CHECKLIST_TITLE_MAX_LENGTH}
          aria-label="Назва чекліста"
          readOnly={isReadOnly}
          enterKeyHint="done"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
        />
      </ChecklistHeading>

      <ChecklistTree
        items={checklist.items}
        isReadOnly={isReadOnly}
        collapsedIds={collapsedIds}
        selectedIds={selection.selectedIds}
        isMultiSelect={selection.isMulti}
        renamingId={selection.renamingId}
        adding={selection.adding}
        onToggle={(itemId) => toggleItem(checklist.id, itemId)}
        onToggleExpand={toggleExpand}
        onSelect={selection.pick}
        onRename={(itemId, title) => renameItem(checklist.id, itemId, title)}
        onRenameEnd={selection.endRename}
        onStartAdd={selection.startAdd}
        onAdd={handleAdd}
        onAddEnd={selection.endAdd}
      />

      {selection.isActive && (
        <>
          {!selection.isMulti && (
            <button
              type="button"
              className={styles.scrim}
              aria-label="Скасувати вибір"
              onClick={selection.reset}
            />
          )}
          <ChecklistItemActionsBar
            count={selection.count}
            isMulti={selection.isMulti}
            onAddSubItem={handleAddSubItem}
            onRename={selection.startRename}
            onSelect={selection.startMulti}
            onDelete={handleDeleteItems}
            onCancel={selection.reset}
          />
        </>
      )}
    </div>

  );
}