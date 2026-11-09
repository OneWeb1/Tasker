import { ArchiveIcon, ClockIcon, SortAlphaIcon } from '@/shared/ui/icons';
import type { NotesView } from '../slice/notesViewSlice';

interface NotesViewOption {
  value: NotesView;
  label: string;
  icon: typeof ClockIcon;
}

export const NOTES_VIEW_OPTIONS: readonly NotesViewOption[] = [
  { value: 'recents', label: 'Нещодавні', icon: ClockIcon },
  { value: 'alphabetical', label: 'За алфавітом', icon: SortAlphaIcon },
  { value: 'archived', label: 'Архів', icon: ArchiveIcon },
];