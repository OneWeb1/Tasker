import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuItem } from '@/shared/ui/MenuItem';
import { SelectionToolbar, SelectionToolbarButton } from '@/shared/ui/SelectionToolbar';
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  MoreIcon,
  PostponeIcon,
  ScissorsIcon,
  TrashIcon,
} from '@/shared/ui/icons';
import type { SelectionSheetView } from '../../model/hooks/useTaskSelection';
import { DeleteConfirm } from '../DeleteConfirm';

interface SelectionBarProps {
  isActive: boolean;
  count: number;
  canComplete: boolean;
  canPostpone: boolean;
  canMove: boolean;
  hasSelection: boolean;
  isSheetOpen: boolean;
  sheetView: SelectionSheetView;
  onCancel: () => void;
  onComplete: () => void;
  onPostpone: () => void;
  onMoveTomorrow: () => void;
  onOpenMenu: () => void;
  onCloseSheet: () => void;
  onViewChange: (view: SelectionSheetView) => void;
  onCopy: () => void;
  onCut: () => void;
  onConfirmDelete: () => void;
}

export function SelectionBar({
  isActive,
  count,
  canComplete,
  canPostpone,
  canMove,
  hasSelection,
  isSheetOpen,
  sheetView,
  onCancel,
  onComplete,
  onPostpone,
  onMoveTomorrow,
  onOpenMenu,
  onCloseSheet,
  onViewChange,
  onCopy,
  onCut,
  onConfirmDelete,
}: SelectionBarProps) {
  return (
    <>
      {isActive && (
        <SelectionToolbar ariaLabel="Дії з вибраними завданнями" count={count} onCancel={onCancel}>
          <SelectionToolbarButton label="Виконати" disabled={!canComplete} onClick={onComplete}>
            <CheckIcon width={22} height={22} />
          </SelectionToolbarButton>
          <SelectionToolbarButton label="На завтра" disabled={!canMove} onClick={onMoveTomorrow}>
            <ArrowRightIcon width={22} height={22} />
          </SelectionToolbarButton>
          <SelectionToolbarButton label="Відкласти" disabled={!canPostpone} onClick={onPostpone}>
            <PostponeIcon width={22} height={22} />
          </SelectionToolbarButton>
          <SelectionToolbarButton label="Більше дій" disabled={!hasSelection} onClick={onOpenMenu}>
            <MoreIcon width={22} height={22} />
          </SelectionToolbarButton>
        </SelectionToolbar>
      )}
      <BottomSheet
        isOpen={isSheetOpen}
        title={sheetView === 'delete' ? 'Видалити завдання?' : 'Дії з вибраними'}
        onClose={onCloseSheet}
      >
        {sheetView === 'menu' && (
          <>
            <MenuItem icon={<CopyIcon width={22} height={22} />} label="Копіювати" onClick={onCopy} />
            <MenuItem
              icon={<ScissorsIcon width={22} height={22} />}
              label="Вирізати"
              onClick={onCut}
            />
            <MenuItem
              icon={<TrashIcon width={22} height={22} />}
              label="Видалити"
              variant="danger"
              onClick={() => onViewChange('delete')}
            />
          </>
        )}
        {sheetView === 'delete' && (
          <DeleteConfirm
            text="Вибрані завдання буде видалено назавжди. Для повторюваних завдань буде видалено всю серію."
            onCancel={() => onViewChange('menu')}
            onConfirm={onConfirmDelete}
          />
        )}
      </BottomSheet>
    </>
  );
}