import { WorkspaceBadge } from '@/entities/workspace';
import { UserAvatar } from '@/features/settings/managePreferences';
import type { RoutePath } from '@/shared/config/routePaths';
import { ArrowLeftIcon, BurgerIcon } from '@/shared/ui/icons';
import { useAppHeader } from '../../model/hooks/useAppHeader';
import { HeaderButton } from '../HeaderButton';
import { NotesHeaderActions } from '../NotesHeaderActions';
import { ProfileHeaderActions } from '../ProfileHeaderActions';
import { WorkspaceSheet } from '../WorkspaceSheet';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  route: RoutePath;
    role?: 'enter' | 'exit' | 'backdrop' | 'peek';
}

export function AppHeader({ route, role = 'enter' }: AppHeaderProps) {
  const {
    workspace,
    isWorkspaceOpen,
    openWorkspaces,
    closeWorkspaces,
    openMenu,
    isWorkspaceVisible,
    isProfilePage,
    isSettingsPage,
    isNotesPage,
    isOverDrawer,
    pageTitle,
    openProfile,
    backFromSettings,
  } = useAppHeader(route);

  return (
    <header
      className={styles.header}
      data-role={role}
      data-transparent={isProfilePage}
      data-over-drawer={isOverDrawer || undefined}
      aria-hidden={role !== 'enter' || undefined}
    >
      {isProfilePage ? (
        <ProfileHeaderActions />
      ) : isSettingsPage ? (
        <>
          <HeaderButton label="Назад" size="sm" onClick={backFromSettings}>
            <ArrowLeftIcon width={20} height={20} />
          </HeaderButton>
          <h1 className={styles.titleCentered}>{pageTitle}</h1>
          <span className={styles.spacer} aria-hidden="true" />
        </>
      ) : isNotesPage ? (
        <NotesHeaderActions title={pageTitle} />
      ) : (
        <>
          {isWorkspaceVisible ? (
            <div className={styles.lead}>
              <HeaderButton label="Меню" size="sm" aria-haspopup="dialog" onClick={openMenu}>
                <BurgerIcon width={20} height={20} />
              </HeaderButton>
              <WorkspaceBadge workspace={workspace} onClick={openWorkspaces} />
            </div>
          ) : (
            <h1 className={styles.title}>{pageTitle}</h1>
          )}
          <HeaderButton label="Профіль" fit="content" onClick={openProfile}>
            <UserAvatar size={32} />
          </HeaderButton>
          {isWorkspaceVisible && (
            <WorkspaceSheet isOpen={isWorkspaceOpen} onClose={closeWorkspaces} />
          )}
        </>
      )}
    </header>
  );
}