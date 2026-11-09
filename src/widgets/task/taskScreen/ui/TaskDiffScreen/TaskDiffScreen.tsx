import { TaskDiffProvider, isRecurringTask } from '@/entities/task';
import type { TaskDiff } from '@/features/createItem';
import { AttachmentsSection } from '@/features/task/attachments';
import { ChecklistsSection } from '@/features/task/checklists';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { useTaskDiffView } from '../../model/hooks/useTaskDiffView';
import { DiffText } from '../DiffText';
import { SubtasksPanel } from '../SubtasksPanel';
import { TaskChips } from '../TaskChips';
import { TaskBlock, TaskBody, TaskDescription, TaskHead } from '../TaskLayout';
import styles from './TaskDiffScreen.module.css';

const TITLE = 'Прев’ю змін';

interface TaskDiffScreenProps {
  isOpen: boolean;
  diff: TaskDiff;
  onClose: () => void;
}

export function TaskDiffScreen({ isOpen, diff, onClose }: TaskDiffScreenProps) {
  const { task, fields, changesCount } = diff;
  const { category, project, workspace, status } = useTaskDiffView(task);
  const showSchedule = fields.schedule.isChanged || isRecurringTask(task);

  return (
    <SlideScreen isOpen={isOpen} title={TITLE} onClose={onClose}>
      <TaskDiffProvider value={diff}>
        <TaskBody>
          <div className={styles.summary}>
            <span className={styles.summaryText}>
              {changesCount > 0 ? `Змін: ${changesCount}` : 'Змін немає'}
            </span>
            <span className={styles.legend} aria-hidden="true">
              <span data-diff="added">+ додано</span>
              <span data-diff="removed">− видалено</span>
              <span data-diff="changed">~ змінено</span>
            </span>
          </div>

          <TaskHead title={<DiffText field={fields.title} variant="title" />}>
            <TaskChips
              task={task}
              status={status}
              category={category}
              project={project}
              workspace={workspace}
              scheduleLabel={showSchedule ? fields.schedule.after : undefined}
              fieldDiffs={fields}
            />
          </TaskHead>

          <TaskDescription>
            <DiffText field={fields.description} variant="description" placeholder="Без опису" />
          </TaskDescription>

          <TaskBlock>
            <SubtasksPanel task={task} />
          </TaskBlock>
          <TaskBlock>
            <ChecklistsSection task={task} />
          </TaskBlock>
          <TaskBlock>
            <AttachmentsSection task={task} />
          </TaskBlock>
        </TaskBody>
      </TaskDiffProvider>
    </SlideScreen>

  );
}