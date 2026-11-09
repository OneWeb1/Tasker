import type { TaskDetailsStatus } from '@/entities/task';
import { CheckIcon, PostponeIcon, StatusIcon } from '@/shared/ui/icons';

interface TaskStatusIconProps {
  status: TaskDetailsStatus;
  size?: number;
}

export function TaskStatusIcon({ status, size = 20 }: TaskStatusIconProps) {
  if (status === 'done') return <CheckIcon width={size} height={size} />;
  if (status === 'postponed') return <PostponeIcon width={size} height={size} />;
  return <StatusIcon width={size} height={size} />;
}