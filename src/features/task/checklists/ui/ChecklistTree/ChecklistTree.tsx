import type { CSSProperties } from 'react';
import type { TaskChecklistItem } from '@/entities/task';
import { PlusIcon } from '@/shared/ui/icons';
import { ChecklistDraftRow } from './ChecklistDraftRow';
import { ChecklistItemRow } from './ChecklistItemRow';
import styles from './ChecklistTree.module.css';

interface ChecklistTreeProps {
  items: readonly TaskChecklistItem[];
  collapsedIds: ReadonlySet<string>;
  selectedIds: ReadonlySet<string>;
  isMultiSelect: boolean;
  renamingId: string | null;
  adding: { parentId: string | null } | null;
  isReadOnly?: boolean;
  onToggle: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onRenameEnd: () => void;
  onStartAdd: (parentId: string | null) => void;
  onAdd: (parentId: string | null, title: string) => void;
  onAddEnd: () => void;
}

interface ChecklistLevelProps extends Omit<ChecklistTreeProps, 'items' | 'onStartAdd'> {
  items: readonly TaskChecklistItem[];
  depth: number;
  parentId: string | null;
}

function ChecklistLevel({ items, depth, parentId, ...shared }: ChecklistLevelProps) {
  const {
    collapsedIds,
    selectedIds,
    isMultiSelect,
    isReadOnly,
    renamingId,
    adding,
    onToggle,
    onToggleExpand,
    onSelect,
    onRename,
    onRenameEnd,
    onAdd,
    onAddEnd,
  } = shared;

  const isAddingHere = adding !== null && adding.parentId === parentId;
  if (items.length === 0 && !isAddingHere) return null;

  const depthStyle = { '--depth': depth } as CSSProperties;

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const children = item.children ?? [];
        const isExpanded = !collapsedIds.has(item.id);

        return (
          <li key={item.id} style={depthStyle}>
            <ChecklistItemRow
              item={item}
              hasChildren={children.length > 0}
              isExpanded={isExpanded}
              isSelected={selectedIds.has(item.id)}
              isMultiSelect={isMultiSelect}
              isRenaming={renamingId === item.id}
              isReadOnly={isReadOnly}
              onToggle={onToggle}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onRename={onRename}
              onRenameEnd={onRenameEnd}
            />
            {isExpanded && (
              <ChecklistLevel {...shared} items={children} depth={depth + 1} parentId={item.id} />
            )}
          </li>
        );
      })}
      {isAddingHere && (
        <li style={depthStyle}>
          <ChecklistDraftRow onCommit={(title) => onAdd(parentId, title)} onEnd={onAddEnd} />
        </li>
      )}
    </ul>

  );
}

export function ChecklistTree({ items, onStartAdd, ...shared }: ChecklistTreeProps) {
  return (
    <div className={styles.tree}>
      <ChecklistLevel {...shared} items={items} depth={0} parentId={null} />
      {!shared.isReadOnly && (
        <button type="button" className={styles.add} onClick={() => onStartAdd(null)}>
          <PlusIcon width={24} height={24} />
          Додати пункт
        </button>
      )}
    </div>
  );
}