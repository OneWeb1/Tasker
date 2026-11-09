import { UserAvatar } from '@/features/settings/managePreferences';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { SettingsIcon } from '@/shared/ui/icons';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function MoreSheet({ isOpen, onClose, onOpenProfile, onOpenSettings }: MoreSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Ще" onClose={onClose}>
      <MenuGroup>
        <MenuItem
          icon={<UserAvatar size={24} />}
          label="Профіль"
          onClick={onOpenProfile}
        />
        <MenuItem
          icon={<SettingsIcon width={22} height={22} />}
          label="Налаштування"
          onClick={onOpenSettings}
        />
      </MenuGroup>
    </BottomSheet>
  );
}