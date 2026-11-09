import { CheckIcon, ListIcon, PostponeIcon, StatusIcon } from '@/shared/ui/icons';
import type { TaskFilter } from '../../model/slice/dayTabSlice';

interface TaskFilterIconProps {
  filter: TaskFilter;
  size?: number;
}

export function TaskFilterIcon({ filter, size }: TaskFilterIconProps) {
  const props = size ? { width: size, height: size } : {};
  if (filter === 'all') return <ListIcon {...props} />;
  if (filter === 'postponed') return <PostponeIcon {...props} />;
  if (filter === 'done') return <CheckIcon {...props} />;
  return <StatusIcon {...props} />;
}