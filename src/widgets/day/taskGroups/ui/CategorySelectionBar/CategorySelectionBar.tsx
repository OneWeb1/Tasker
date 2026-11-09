import { SelectionToolbar, SelectionToolbarButton } from '@/shared/ui/SelectionToolbar';
import { CopyIcon, ScissorsIcon } from '@/shared/ui/icons';

interface CategorySelectionBarProps {
  isActive: boolean;
  count: number;
  hasSelection: boolean;
  canCut: boolean;
  onCancel: () => void;
  onCopy: () => void;
  onCut: () => void;
}

export function CategorySelectionBar({
  isActive,
  count,
  hasSelection,
  canCut,
  onCancel,
  onCopy,
  onCut,
}: CategorySelectionBarProps) {
  if (!isActive) return null;

  return (
    <SelectionToolbar ariaLabel="Дії з вибраними категоріями" count={count} onCancel={onCancel}>
      <SelectionToolbarButton label="Копіювати" disabled={!hasSelection} onClick={onCopy}>
        <CopyIcon width={22} height={22} />
      </SelectionToolbarButton>
      <SelectionToolbarButton label="Вирізати" disabled={!canCut} onClick={onCut}>
        <ScissorsIcon width={22} height={22} />
      </SelectionToolbarButton>
    </SelectionToolbar>
  );
}