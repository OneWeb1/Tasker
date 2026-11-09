import { useCallback, useState } from 'react';
import { useSearchScreen } from '@/features/day/searchDay';
import { useNoteClipboard } from '@/features/note/clipboardNotes';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { forgetRouteOrigin } from '@/shared/lib/utils/routeOrigin';
import { getBackPath } from '../lib/getBackPath';

export function useNotesHeaderActions() {
  const [, navigate] = useHashPath();
  const { open: openSearch } = useSearchScreen();
  const { workspace } = useActiveWorkspace();
  const { clipboardCount } = useNoteClipboard();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const goBack = useCallback(() => {
    navigate(getBackPath(ROUTE_PATHS.notes, false) ?? ROUTE_PATHS.today);
    forgetRouteOrigin(ROUTE_PATHS.notes);
  }, [navigate]);

  return {
    goBack,
    openSearch,
    workspaceId: workspace.id,
    canPaste: clipboardCount > 0,
    isMenuOpen,
    openMenu,
    closeMenu,
  };
}