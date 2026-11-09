import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { SparklesIcon } from '@/shared/ui/icons';

interface NoteSectionActionsSheetProps {
  isOpen: boolean;
  onImproveWithAi: () => void;
  onClose: () => void;
}

export function NoteSectionActionsSheet({
  isOpen,
  onImproveWithAi,
  onClose,
}: NoteSectionActionsSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Дії з блоком" onClose={onClose}>
      <MenuGroup>
        <MenuItem
          icon={<SparklesIcon width={22} height={22} />}
          label="Покращити через ШІ"
          onClick={onImproveWithAi}
        />
      </MenuGroup>
    </BottomSheet>
  );
}