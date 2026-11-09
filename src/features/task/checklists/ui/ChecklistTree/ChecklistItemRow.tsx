import { useDiffKind } from '@/entities/task';
import type { TaskChecklistItem } from '@/entities/task';
import { useLongPress } from '@/shared/lib/hooks/useLongPress';
import { Checkbox } from '@/shared/ui/Checkbox';
import { DiffSign } from '@/shared/ui/DiffSign';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { ChecklistTitleInput } from '../ChecklistTitleInput';
import styles from './ChecklistTree.module.css';

interface ChecklistItemRowProps {
  item: TaskChecklistItem;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isMultiSelect: boolean;
  isRenaming: boolean;
  isReadOnly?: boolean;
  onToggle: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onRenameEnd: () => void;
}

export function ChecklistItemRow({
  item,
  hasChildren,
  isExpanded,
  isSelected,
  isMultiSelect,
  isRenaming,
  isReadOnly = false,
  onToggle,
  onToggleExpand,
  onSelect,
  onRename,
  onRenameEnd,
}: ChecklistItemRowProps) {
  const longPress = useLongPress({ onLongPress: () => onSelect(item.id) });
  const kind = useDiffKind(item.id);

  return (
    <div
      className={styles.row}
      data-done={item.done}
      data-diff={kind}
      data-selected={isSelected}
      data-editing={isRenaming}
      {...(isRenaming || isReadOnly ? undefined : longPress)}
      onClick={(event) => {
        if (isReadOnly || !isMultiSelect || isRenaming) return;
        if ((event.target as HTMLElement).closest('input, button')) return;
        onSelect(item.id);
      }}
    >
      <DiffSign kind={kind} />
      <span className={styles.gutter}>
        {hasChildren && (
          <button
            type="button"
            className={styles.expand}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Згорнути' : 'Розгорнути'}: ${item.title}`}
            onClick={() => onToggleExpand(item.id)}
          >
            <ChevronDownIcon width={16} height={16} />
          </button>
        )}
      </span>
      <span className={styles.box}>
        <Checkbox
          checked={item.done}
          label={item.title}
          disabled={isReadOnly}
          onChange={() => onToggle(item.id)}
        />
      </span>
      {isRenaming ? (
        <ChecklistTitleInput
          label="Назва пункту"
          initialValue={item.title}
          onCommit={(title) => {
            if (title !== item.title) onRename(item.id, title);
          }}
          onEnd={onRenameEnd}
        />
      ) : (
        <span className={styles.name}>{item.title}</span>
      )}
    </div>
  );
}