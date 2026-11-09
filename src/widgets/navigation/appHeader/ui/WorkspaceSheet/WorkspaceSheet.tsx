import { createPortal } from 'react-dom';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { IconButton } from '@/shared/ui/IconButton';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { CheckIcon, EditIcon, MoreIcon, PlusIcon, TrashIcon } from '@/shared/ui/icons';
import { useWorkspaceSheet } from '../../model/hooks/useWorkspaceSheet';
import { WorkspaceCreateForm } from './WorkspaceCreateForm';
import { WorkspaceDeleteConfirm } from './WorkspaceDeleteConfirm';
import { WorkspaceRenameForm } from './WorkspaceRenameForm';
import styles from './WorkspaceSheet.module.css';

interface WorkspaceSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const noop = (): void => {};

export function WorkspaceSheet({ isOpen, onClose }: WorkspaceSheetProps) {
  const {
    view,
    workspaces,
    target,
    canDelete,
    activeId,
    activate,
    remove,
    openActions,
    showCreate,
    showRename,
    showDelete,
    back,
    showList,
  } = useWorkspaceSheet(isOpen);

  const handleActivate = (id: string) => {
    activate(id);
    onClose();
  };

  const isActionsOpen = isOpen && (view === 'actions' || view === 'rename' || view === 'delete');
  const closeMain = view === 'list' ? onClose : noop;
  const closeActions = view === 'actions' ? back : noop;

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        title="Робочі простори"
        isCovered={view === 'create' || view === 'rename'}
        onClose={closeMain}
      >
        <div className={styles.content}>
          <MenuGroup>
          <ul className={styles.items}>
            {workspaces.map((workspace) => (
              <li
                key={workspace.id}
                className={styles.row}
                data-active={workspace.id === activeId || undefined}
              >
                <button
                  type="button"
                  className={styles.item}
                  aria-current={workspace.id === activeId || undefined}
                  onClick={() => handleActivate(workspace.id)}
                >
                  <span className={styles.emoji} aria-hidden="true">
                    {workspace.emoji}
                  </span>
                  <span className={styles.name}>{workspace.title}</span>
                  {workspace.id === activeId && (
                    <span className={styles.check} aria-hidden="true">
                      <CheckIcon width={14} height={14} />
                    </span>
                  )}
                </button>
                <IconButton
                  variant="ghost"
                  label={`Дії простору: ${workspace.title}`}
                  aria-haspopup="dialog"
                  onClick={() => openActions(workspace.id)}
                >
                  <MoreIcon width={18} height={18} />
                </IconButton>
              </li>
            ))}
          </ul>
          </MenuGroup>
          <MenuGroup>
            <MenuItem
              icon={<PlusIcon width={24} height={24} />}
              label="Створити простір"
              onClick={showCreate}
            />
          </MenuGroup>
        </div>
      </BottomSheet>

      {createPortal(
        <SlideScreen isOpen={isOpen && view === 'create'} title="Новий простір" onClose={back}>
          <WorkspaceCreateForm
            workspaces={workspaces}
            onCreated={(workspace) => handleActivate(workspace.id)}
          />
        </SlideScreen>,
        document.body,
      )}

      <BottomSheet
        isOpen={isActionsOpen}
        title={target?.title ?? 'Простір'}
        isCovered={view === 'rename'}
        onBack={back}
        onClose={closeActions}
      >
        {target && (
          <div className={styles.content}>
            <MenuGroup>
            <MenuItem
              icon={<EditIcon width={22} height={22} />}
              label="Перейменувати"
              onClick={showRename}
            />
            {canDelete && (
              <MenuItem
                icon={<TrashIcon width={22} height={22} />}
                label="Видалити простір"
                variant="danger"
                onClick={showDelete}
              />
            )}
            </MenuGroup>
          </div>
        )}
      </BottomSheet>

      {createPortal(
        <SlideScreen isOpen={isOpen && view === 'rename'} title="Перейменувати" onClose={back}>
          {target && (
            <WorkspaceRenameForm
              key={target.id}
              workspace={target}
              workspaces={workspaces}
              onRenamed={showList}
            />
          )}
        </SlideScreen>,
        document.body,
      )}

      <BottomSheet
        isOpen={isOpen && view === 'delete'}
        title="Видалити простір?"
        onBack={back}
        onClose={back}
      >
        {target && (
          <WorkspaceDeleteConfirm
            workspace={target}
            onCancel={back}
            onConfirm={() => remove(target.id)}
          />
        )}
      </BottomSheet>
    </>

  );
}