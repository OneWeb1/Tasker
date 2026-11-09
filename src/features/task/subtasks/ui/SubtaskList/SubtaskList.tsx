import type { TaskSubtask } from '@/entities/task';
import { useDiffKind } from '@/entities/task';
import { useLongPress } from '@/shared/lib/hooks/useLongPress';
import { DiffSign } from '@/shared/ui/DiffSign';
import { CheckIcon, StatusIcon } from '@/shared/ui/icons';
import type { SubtaskSelection } from '../../model/types/subtask';
import styles from './SubtaskList.module.css';

interface SubtaskRowProps {
  item: TaskSubtask;
  selection?: SubtaskSelection;
  onOpen: (id: string) => void;
  onToggle?: (id: string) => void;
}

function SubtaskRow({ item, selection, onOpen, onToggle }: SubtaskRowProps) {
  const kind = useDiffKind(item.id);
  const longPress = useLongPress({ onLongPress: () => selection?.onLongPress(item.id) });
  const isSelecting = selection?.isActive ?? false;
  const isSelected = selection?.selectedIds.has(item.id) ?? false;
  const handle = (action: () => void) => () =>
    selection?.isActive ? selection.onTap(item.id) : action();

  return (
    <li
      className={styles.item}
      data-done={item.done}
      data-diff={kind}
      data-selectable={selection ? true : undefined}
      data-selected={isSelecting ? isSelected : undefined}
      {...(selection ? longPress : undefined)}
    >
      <DiffSign kind={kind} />
      <button
        type="button"
        className={styles.toggle}
        role="checkbox"
        aria-checked={item.done}
        aria-label={item.title}
        disabled={!onToggle}
        onClick={handle(() => onToggle?.(item.id))}
      >
        {item.done ? <CheckIcon width={24} height={24} /> : <StatusIcon width={24} height={24} />}
      </button>
      <button
        type="button"
        className={styles.text}
        aria-pressed={isSelecting ? isSelected : undefined}
        onClick={handle(() => onOpen(item.id))}
      >
        <span className={styles.name}>{item.title}</span>
        {item.description && <span className={styles.description}>{item.description}</span>}
      </button>
    </li>
  );
}

interface SubtaskListProps {
  items: readonly TaskSubtask[];
  selection?: SubtaskSelection;
  onOpen: (id: string) => void;
  onToggle?: (id: string) => void;
}

export function SubtaskList({ items, selection, onOpen, onToggle }: SubtaskListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <SubtaskRow
          key={item.id}
          item={item}
          selection={selection}
          onOpen={onOpen}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}