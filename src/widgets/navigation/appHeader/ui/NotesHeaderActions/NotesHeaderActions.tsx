import { NotesViewToggle } from '@/features/note/browseNotes';
import { NotesMenuSheet } from '@/features/note/clipboardNotes';
import { ArrowLeftIcon, MoreIcon, SearchIcon } from '@/shared/ui/icons';
import { useNotesHeaderActions } from '../../model/hooks/useNotesHeaderActions';
import { HeaderButton } from '../HeaderButton';
import styles from './NotesHeaderActions.module.css';

interface NotesHeaderActionsProps {
  title: string;
}

export function NotesHeaderActions({ title }: NotesHeaderActionsProps) {
  const { goBack, openSearch, workspaceId, canPaste, isMenuOpen, openMenu, closeMenu } =
    useNotesHeaderActions();

  return (
    <>
      <div className={styles.lead}>
        <HeaderButton label="Назад" size="sm" onClick={goBack}>
          <ArrowLeftIcon width={20} height={20} />
        </HeaderButton>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.actions}>
        <HeaderButton label="Пошук нотаток" size="sm" aria-haspopup="dialog" onClick={openSearch}>
          <SearchIcon width={20} height={20} />
        </HeaderButton>
        <NotesViewToggle />
        {canPaste && (
          <HeaderButton label="Дії з нотатками" size="sm" aria-haspopup="dialog" onClick={openMenu}>
            <MoreIcon width={20} height={20} />
          </HeaderButton>
        )}
      </div>
      <NotesMenuSheet isOpen={isMenuOpen} workspaceId={workspaceId} onClose={closeMenu} />
    </>
  );
}