import { UserAvatar } from '@/features/settings/managePreferences';
import { Drawer } from '@/shared/ui/Drawer';
import { CloseIcon, PlusIcon, SettingsIcon, TrashIcon } from '@/shared/ui/icons';
import { useNavDrawer } from '../../model/hooks/useNavDrawer';
import { HeaderButton } from '../HeaderButton';
import { NewProjectSheet } from '../NewProjectSheet';
import { ProjectDeleteSheet } from '../ProjectDeleteSheet';
import { ProjectRow } from '../ProjectRow';
import styles from './NavDrawer.module.css';

interface NavDrawerProps {
  isOpen: boolean;
  isCovered: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function NavDrawer({
  isOpen,
  isCovered,
  onClose,
  onOpenProfile,
  onOpenSettings,
}: NavDrawerProps) {
  const nav = useNavDrawer(onClose);

  const footer = nav.isSelecting ? (
    <div className={styles.footer} role="toolbar" aria-label="Дії з вибраними проєктами">
      <HeaderButton label="Скасувати вибір" size="sm" onClick={nav.cancelSelection}>
        <CloseIcon width={20} height={20} />
      </HeaderButton>
      <span className={styles.selectionCount} aria-live="polite">
        Вибрано: {nav.selectedCount}
      </span>
      <HeaderButton label="Видалити" size="sm" tone="danger" onClick={nav.requestDelete}>
        <TrashIcon width={20} height={20} />
      </HeaderButton>
    </div>
  ) : (
    <div className={styles.footer}>
      <button type="button" className={styles.profile} onClick={onOpenProfile}>
        <UserAvatar size={30} />
        <span className={styles.profileName}>{nav.userName || 'Профіль'}</span>
      </button>
      <HeaderButton label="Налаштування" size="sm" onClick={onOpenSettings}>
        <SettingsIcon width={20} height={20} />
      </HeaderButton>
    </div>
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        isCovered={isCovered}
        title="Tasker"
        side="left"
        onClose={nav.close}
        footer={footer}
      >
        <div className={styles.content}>
          <button type="button" className={styles.newProject} onClick={nav.openNewProject}>
            <span className={styles.newProjectIcon} aria-hidden="true">
              <PlusIcon width={22} height={22} />
            </span>
            <span className={styles.newProjectText}>
              <span className={styles.newProjectTitle}>Новий проєкт</span>
              <span className={styles.newProjectHint}>Групуйте завдання за метою</span>
            </span>
          </button>

          <h3 className={styles.section}>Проєкти</h3>

          {nav.items.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Проєктів поки немає</p>
              <p className={styles.emptyText}>Створіть перший проєкт у цьому просторі</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {nav.items.map(({ project, openTasksCount }) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  openTasksCount={openTasksCount}
                  isActive={project.id === nav.activeProjectId}
                  isSelecting={nav.isSelecting}
                  isSelected={nav.isSelected(project.id)}
                  onPress={() => nav.pressItem(project.id)}
                  onLongPress={() => nav.longPressItem(project.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </Drawer>

      <NewProjectSheet
        isOpen={nav.isNewProjectOpen}
        projects={nav.projects}
        workspaceId={nav.workspaceId}
        onClose={nav.closeNewProject}
      />
      <ProjectDeleteSheet
        isOpen={nav.isDeleteOpen}
        count={nav.selectedCount}
        onClose={nav.closeDelete}
        onConfirm={nav.confirmDelete}
      />
    </>

  );
}