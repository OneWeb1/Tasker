import { createPortal } from 'react-dom';
import type { Category } from '@/entities/category';
import { CATEGORY_TITLE_MAX_LENGTH, getCategoryColorStyle } from '@/entities/category';
import type { CategoryAppearance } from '@/features/category/editCategoryAppearance';
import { ActionTile } from '@/shared/ui/ActionTile';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { SheetHeader } from '@/shared/ui/SheetHeader';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import {
  ArrowRightIcon,
  CopyIcon,
  EditIcon,
  PaletteIcon,
  PasteIcon,
  PlusIcon,
  ScissorsIcon,
  SelectIcon,
  TrashIcon,
} from '@/shared/ui/icons';
import type { CategorySheetView } from '../../model/hooks/useCategoryActions';
import { AppearanceForm } from '../AppearanceForm';
import { DeleteConfirm } from '../DeleteConfirm';
import { PasteCategoriesSheet } from '../PasteCategoriesSheet';
import { RenameForm } from '../RenameForm';
import styles from './CategoryActionsSheet.module.css';

interface CategoryActionsSheetProps {
  category: Category | null;
  tasksCount: number;
  movableCount: number;
  pasteCount: number;
  pasteCategoriesCount: number;
  canPasteAsCategory: boolean;
  isPasteChoiceOpen: boolean;
  canDelete: boolean;
  canCut: boolean;
  isOpen: boolean;
  view: CategorySheetView;
  onClose: () => void;
  onViewChange: (view: CategorySheetView) => void;
  onAddTask: () => void;
  onSelect: () => void;
  onCopy: () => void;
  onCut: () => void;
  onRename: (title: string) => void;
  onAppearance: (appearance: CategoryAppearance) => void;
  onMoveTomorrow: () => void;
  onPaste: () => void;
  onOpenPasteChoice: () => void;
  onClosePasteChoice: () => void;
  onPasteAsCategory: () => void;
  onPasteCategoryTasks: () => void;
  onDelete: () => void;
}

const noop = (): void => {};

export function CategoryActionsSheet({
  category,
  tasksCount,
  movableCount,
  pasteCount,
  pasteCategoriesCount,
  canPasteAsCategory,
  isPasteChoiceOpen,
  canDelete,
  canCut,
  isOpen,
  view,
  onClose,
  onViewChange,
  onAddTask,
  onSelect,
  onCopy,
  onCut,
  onRename,
  onAppearance,
  onMoveTomorrow,
  onPaste,
  onOpenPasteChoice,
  onClosePasteChoice,
  onPasteAsCategory,
  onPasteCategoryTasks,
  onDelete,
}: CategoryActionsSheetProps) {
  const title =
    view === 'rename'
      ? 'Перейменувати категорію'
      : view === 'appearance'
        ? 'Вигляд категорії'
        : view === 'delete'
          ? 'Видалити категорію?'
          : (category?.title ?? '');

  return (
    <>
    <BottomSheet
      isOpen={isOpen}
      title={title}
      isCovered={view === 'rename' || isPasteChoiceOpen}
      onClose={view === 'rename' || isPasteChoiceOpen ? noop : onClose}
      header={
        category && (view === 'menu' || view === 'rename') ? (
          <div style={{ display: 'contents', ...getCategoryColorStyle(category.color) }}>
            <SheetHeader
              icon={category.emoji}
              color={category.color}
              title={category.title}
              subtitle={`Завдань: ${tasksCount}`}
              onClose={onClose}
            />
          </div>
        ) : undefined
      }
    >
      {category && (view === 'menu' || view === 'rename') && (
        <>
          <div className={styles.tiles}>
            <ActionTile
              icon={<PlusIcon width={24} height={24} />}
              label="Додати"
              onClick={onAddTask}
            />
            <ActionTile
              icon={<SelectIcon width={24} height={24} />}
              label="Вибрати"
              onClick={onSelect}
            />
            <ActionTile
              icon={<ScissorsIcon width={24} height={24} />}
              label="Вирізати"
              disabled={!canCut}
              onClick={onCut}
            />
            <ActionTile
              icon={<PaletteIcon width={24} height={24} />}
              label="Вигляд"
              onClick={() => onViewChange('appearance')}
            />
            <ActionTile
              icon={<ArrowRightIcon width={24} height={24} />}
              label="На завтра"
              disabled={movableCount === 0}
              onClick={onMoveTomorrow}
            />
          </div>
          <div className={styles.divider} />
          <MenuGroup>
          <MenuItem
            icon={<CopyIcon width={22} height={22} />}
            label="Копіювати"
            onClick={onCopy}
          />
          <MenuItem
            icon={<EditIcon width={22} height={22} />}
            label="Редагувати"
            onClick={() => onViewChange('rename')}
          />
          {pasteCount > 0 && (
            <MenuItem
              icon={<PasteIcon width={22} height={22} />}
              label={`Вставити (${pasteCount})`}
              onClick={onPaste}
            />
          )}
          {pasteCategoriesCount > 0 && (
            <MenuItem
              icon={<PasteIcon width={22} height={22} />}
              label={`Вставити категорії (${pasteCategoriesCount})`}
              onClick={onOpenPasteChoice}
            />
          )}
          </MenuGroup>
          {canDelete && (
            <>
              <div className={styles.divider} />
              <MenuGroup>
                <MenuItem
                  icon={<TrashIcon width={22} height={22} />}
                  label="Видалити категорію"
                  variant="danger"
                  onClick={() => onViewChange('delete')}
                />
              </MenuGroup>
            </>
          )}
        </>
      )}



      {category && view === 'appearance' && (
        <AppearanceForm
          initialEmoji={category.emoji}
          initialColor={category.color}
          onSubmit={onAppearance}
        />
      )}

      {category && view === 'delete' && (
        <DeleteConfirm
          text={`«${category.title}» буде видалено. Її завдання перейдуть до категорії за замовчуванням.`}
          onCancel={() => onViewChange('menu')}
          onConfirm={onDelete}
        />
      )}
    </BottomSheet>
    <PasteCategoriesSheet
      category={category}
      isOpen={isOpen && isPasteChoiceOpen}
      canPasteAsCategory={canPasteAsCategory}
      onClose={onClosePasteChoice}
      onPasteAsCategory={onPasteAsCategory}
      onPasteCategoryTasks={onPasteCategoryTasks}
    />
    {createPortal(
      <SlideScreen
        isOpen={isOpen && view === 'rename'}
        title="Перейменувати категорію"
        onClose={() => onViewChange('menu')}
      >
        {category && (
          <RenameForm
            initialTitle={category.title}
            label="Назва категорії"
            maxLength={CATEGORY_TITLE_MAX_LENGTH}
            onSubmit={onRename}
          />
        )}
      </SlideScreen>,
      document.body,
    )}
    </>
  );
}