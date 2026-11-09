import { parseSubtaskId, parseTaskId } from '@/shared/config/routePaths';
import { TaskScreen } from '@/widgets/task/taskScreen';

interface TaskPageProps {
  path: string;
}

export function TaskPage({ path }: TaskPageProps) {
  const taskId = parseTaskId(path);
  if (!taskId) return null;

  return <TaskScreen key={taskId} taskId={taskId} subtaskId={parseSubtaskId(path) ?? undefined} />;
}