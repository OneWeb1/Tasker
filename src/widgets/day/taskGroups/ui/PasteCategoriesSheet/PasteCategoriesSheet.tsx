import type { Category } from '@/entities/category';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { PasteIcon } from '@/shared/ui/icons';

interface PasteCategoriesSheetProps {
  category: Category | null;
  isOpen: boolean;
  canPasteAsCategory: boolean;
  onClose: () => void;
  onPasteAsCategory: () => void;
  onPasteCategoryTasks: () => void;
}

export function PasteCategoriesSheet({
  category,
  isOpen,
  canPasteAsCategory,
  onClose,
  onPasteAsCategory,
  onPasteCategoryTasks,
}: PasteCategoriesSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Що вставити?" onClose={onClose}>
      {category && (
        <MenuGroup>
          {canPasteAsCategory && (
            <MenuItem
              icon={<PasteIcon width={22} height={22} />}
              label="Вставити як категорію"
              onClick={onPasteAsCategory}
            />
          )}
          <MenuItem
            icon={<PasteIcon width={22} height={22} />}
            label={`Вставити завдання в «${category.title}»`}
            onClick={onPasteCategoryTasks}
          />
        </MenuGroup>
      )}
    </BottomSheet>
  );
}