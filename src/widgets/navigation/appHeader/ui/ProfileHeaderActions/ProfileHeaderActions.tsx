import { ResetHistorySheet } from '@/features/settings/resetData';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { ArrowLeftIcon, MoreIcon, RestoreIcon, ThemeIcon } from '@/shared/ui/icons';
import { useProfileHeaderActions } from '../../model/hooks/useProfileHeaderActions';
import { HeaderButton } from '../HeaderButton';

export function ProfileHeaderActions() {
  const {
    isDark,
    history,
    isMenuOpen,
    isHistoryOpen,
    goBack,
    openMenu,
    closeMenu,
    closeHistory,
    toggleTheme,
    openHistory,
  } = useProfileHeaderActions();

  return (
    <>
      <HeaderButton label="Назад" size="sm" onClick={goBack}>
        <ArrowLeftIcon width={20} height={20} />
      </HeaderButton>
      <HeaderButton label="Дії профілю" size="sm" aria-haspopup="dialog" onClick={openMenu}>
        <MoreIcon width={20} height={20} />
      </HeaderButton>

      <BottomSheet isOpen={isMenuOpen} title="Дії профілю" onClose={closeMenu}>
        <MenuGroup>
          <MenuItem
            icon={<ThemeIcon width={22} height={22} />}
            label={isDark ? 'Світла тема' : 'Темна тема'}
            onClick={toggleTheme}
          />
          <MenuItem
            icon={<RestoreIcon width={22} height={22} />}
            label="Історія скидань"
            onClick={openHistory}
          />
        </MenuGroup>
      </BottomSheet>

      <ResetHistorySheet isOpen={isHistoryOpen} onClose={closeHistory} history={history} />
    </>

  );
}