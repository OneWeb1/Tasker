import type { ReactNode } from 'react';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import {
  AttachmentIcon,
  CheckIcon,
  ChecklistIcon,
  ClockIcon,
  CommentIcon,
  ListIcon,
  StatusIcon,
} from '@/shared/ui/icons';
import { getSubtaskProgress } from '../../lib/subtaskProgress';
import { getTaskIndicators } from '../../lib/taskIndicators';
import type { Task } from '../../model/types/task';
import { TaskPriorityBadge } from '../TaskPriorityBadge';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  isDone: boolean;
  isSelected?: boolean;
  onOpen: () => void;
  meta?: ReactNode;
  actions?: ReactNode;
  avatar?: ReactNode;
}

const getTimeLabel = (task: Task): string | null => {
  if (!task.startTime) return null;
  return task.endTime ? `${task.startTime} – ${task.endTime}` : task.startTime;
};

export function TaskItem({
  task,
  isDone,
  isSelected,
  onOpen,
  meta,
  actions,
  avatar,
}: TaskItemProps) {
  const isSelecting = isSelected !== undefined;
  const progress = getSubtaskProgress(task);
  const { checklist, comments, attachments } = getTaskIndicators(task);
  const time = getTimeLabel(task);

  const hasChips = Boolean(meta) || time !== null;

  return (
    <li
      className={styles.card}
      data-done={isDone}
      data-selected={isSelecting ? isSelected : undefined}
    >
      <div className={styles.top}>
        <span className={styles.status} aria-hidden="true">
          {isDone ? <CheckIcon width={20} height={20} /> : <StatusIcon width={20} height={20} />}
        </span>
        <h3 className={styles.heading}>
          <button
            type="button"
            className={styles.open}
            aria-haspopup={isSelecting ? undefined : 'dialog'}
            aria-pressed={isSelecting ? isSelected : undefined}
            onClick={onOpen}
          >
            <span className={styles.title}>{task.title}</span>
            {isDone && <span className={styles.srOnly}>, виконано</span>}
          </button>
        </h3>
        {actions && <div className={styles.side}>{actions}</div>}
      </div>

      {task.description && <p className={styles.description}>{task.description}</p>}

      {hasChips && (
        <div className={styles.chips}>
          {meta && <span className={styles.chip}>{meta}</span>}
          {time && (
            <span className={styles.time}>
              <ClockIcon width={14} height={14} />
              {time}
            </span>
          )}
        </div>
      )}

      {progress && (
        <div className={styles.progressRow}>
          <span className={styles.count} title="Підзавдання">
            <ListIcon width={16} height={16} />
            {progress.done}/{progress.total}
          </span>
          <span className={styles.bar}>
            <ProgressBar done={progress.done} total={progress.total} label="Прогрес підзавдань" />
          </span>
        </div>
      )}

      {checklist && (
        <div className={styles.progressRow}>
          <span className={styles.count} title="Чеклісти">
            <ChecklistIcon width={16} height={16} />
            {checklist.done}/{checklist.total}
          </span>
          <span className={styles.bar}>
            <ProgressBar done={checklist.done} total={checklist.total} label="Прогрес чеклістів" />
          </span>
        </div>
      )}

      {
        <div className={styles.footer}>
          <TaskPriorityBadge priority={task.priority} variant="chip" />
          {comments > 0 && (
            <span className={styles.count} title="Коментарі">
              <CommentIcon width={16} height={16} />
              {comments}
            </span>
          )}
          {attachments > 0 && (
            <span className={styles.count} title="Вкладення">
              <AttachmentIcon width={16} height={16} />
              {attachments}
            </span>
          )}
          {avatar && <span className={styles.avatar}>{avatar}</span>}
        </div>
      }
    </li>

  );
}