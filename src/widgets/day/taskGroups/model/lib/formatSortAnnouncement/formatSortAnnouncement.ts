import type { Category } from '@/entities/category';
import type { SortableAnnouncement } from '@/shared/lib/hooks/useSortableList';

export const formatSortAnnouncement = (
  announcement: SortableAnnouncement | null,
  categories: readonly Category[],
): string => {
  if (!announcement) return '';

  const title = categories.find((category) => category.id === announcement.id)?.title ?? '';
  const position = `позиція ${announcement.position} з ${announcement.total}`;

  switch (announcement.type) {
    case 'lift':
      return `${title}: піднято, ${position}. Стрілками змініть позицію, пробіл — покласти, Escape — скасувати.`;
    case 'move':
      return `${title}: ${position}.`;
    case 'drop':
      return `${title}: покладено, ${position}.`;
    case 'cancel':
      return `${title}: переміщення скасовано.`;
  }
};