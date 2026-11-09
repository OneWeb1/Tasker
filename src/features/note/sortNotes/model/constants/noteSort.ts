import { ClockIcon, ListIcon, RestoreIcon } from '@/shared/ui/icons';
import type { NoteSortOrder } from '../slice/noteSortSlice';

interface NoteSortOption {
  value: NoteSortOrder;
  label: string;
  icon: typeof ClockIcon;
}

export const NOTE_SORT_OPTIONS: readonly NoteSortOption[] = [
  { value: 'newest', label: 'Спочатку нові', icon: ClockIcon },
  { value: 'oldest', label: 'Спочатку старі', icon: RestoreIcon },
  { value: 'title', label: 'За назвою', icon: ListIcon },
];