import type { ReactNode } from 'react';
import { TaskPatchContext, TaskPrioritySheet, resolveSubtaskTask } from '@/entities/task';
import type { Task, TaskDetailsStatus } from '@/entities/task';
import { DESCRIPTION_MAX_LENGTH, TITLE_FOCUS_DELAY_MS } from '@/features/createItem';
import { AttachmentsSection } from '@/features/task/attachments';
import { ChecklistsSection } from '@/features/task/checklists';
import { useSubtasks } from '@/features/task/subtasks';
import { Button } from '@/shared/ui/Button';
import { EditableText } from '@/shared/ui/EditableText';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { TASK_STATUS_LABELS } from '../../model/constants/taskScreen';
import { useSubtaskCreator } from '../../model/hooks/useSubtaskCreator';
import { DatesSheet } from '../DatesSheet';
import { OptionSheet } from '../OptionSheet';
import { TaskChips } from '../TaskChips';
import { TaskStatusIcon } from '../TaskStatusIcon';
import styles from './SubtaskCreateScreen.module.css';

const STATUS_VALUES: readonly TaskDetailsStatus[] = ['active', 'done'];

interface SubtaskCreateScreenProps {
  isOpen: boolean;
  root: Task;
  parentId?: string;
  renderSubtasks: (draftTask: Task) => ReactNode;
  onClose: () => void;
}

export function SubtaskCreateScreen({
  isOpen,
  root,
  parentId,
  renderSubtasks,
  onClose,
}: SubtaskCreateScreenProps) {
  const { addSubtask } = useSubtasks(root, parentId);
  const parent =
    parentId === undefined ? root : (resolveSubtaskTask(root, parentId)?.task ?? root);
  const creator = useSubtaskCreator(parent, (draft) => {
    addSubtask(draft);
    onClose();
  });

  const statusOptions = STATUS_VALUES.map((value) => ({
    value,
    label: TASK_STATUS_LABELS[value],
    leading: <TaskStatusIcon status={value} />,
  }));

  return (
    <>
      <SlideScreen isOpen={isOpen} title="Нове підзавдання" onClose={onClose}>
        <div className={styles.head}>
          <EditableText
            variant="title"
            label="Назва підзавдання"
            placeholder="Що потрібно зробити?"
            value={creator.title}
            autoFocusDelay={TITLE_FOCUS_DELAY_MS}
            onChange={creator.setTitle}
            onSave={creator.setTitle}
          />
          <TaskChips
            task={{ ...creator.dates, priority: creator.priority }}
            status={creator.status}
            onOpenStatus={() => creator.openSheet('status')}
            onOpenDates={() => creator.openSheet('dates')}
            onOpenPriority={() => creator.openSheet('priority')}
          />
        </div>

        <div className={styles.description}>
          <EditableText
            variant="description"
            label="Опис підзавдання"
            placeholder="Додайте опис…"
            value={creator.description}
            maxLength={DESCRIPTION_MAX_LENGTH}
                        onChange={creator.setDescription}
            onSave={creator.setDescription}
          />
        </div>

        <TaskPatchContext.Provider value={creator.patchDraft}>
          <div className={styles.section}>{renderSubtasks(creator.draftTask)}</div>
          <div className={styles.section}>
            <ChecklistsSection task={creator.draftTask} />
          </div>
          <div className={styles.section}>
            <AttachmentsSection task={creator.draftTask} />
          </div>
        </TaskPatchContext.Provider>

        <form className={styles.footer} onSubmit={creator.handleSubmit}>
          <Button type="submit" fullWidth disabled={!creator.isValid}>
            Створити
          </Button>
        </form>
      </SlideScreen>

      <OptionSheet
        isOpen={creator.sheet === 'status'}
        title="Статус"
        options={statusOptions}
        value={creator.status}
        onSelect={creator.changeStatus}
        onClose={creator.closeSheet}
      />
      <DatesSheet
        value={creator.dates}
        isRecurring={false}
        bounds={creator.bounds}
        isOpen={creator.sheet === 'dates'}
        onClose={creator.closeSheet}
        onSave={creator.changeDates}
      />
      <TaskPrioritySheet
        isOpen={creator.sheet === 'priority'}
        value={creator.priority}
        onSelect={creator.changePriority}
        onClose={creator.closeSheet}
      />
    </>

  );
}