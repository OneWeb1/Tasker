import { TaskPatchContext, TaskPrioritySheet, useDiffKind, useTaskDiff } from '@/entities/task';
import type { Task, TaskDetailsStatus } from '@/entities/task';
import { AttachmentsSection } from '@/features/task/attachments';
import { ChecklistsSection } from '@/features/task/checklists';
import { SubtasksBlock } from '@/features/task/subtasks';
import type { SubtaskPatch } from '@/features/task/subtasks';
import { useTabShiftStore } from '@/shared/lib/hooks/useTabShift';
import { EditableText } from '@/shared/ui/EditableText';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { TabPanel } from '@/shared/ui/TabPanel';
import { Tabs } from '@/shared/ui/Tabs';
import { ArrowUpIcon, MoreIcon, SubtaskIcon } from '@/shared/ui/icons';
import { TASK_SCREEN_TABS, TASK_STATUS_LABELS } from '../../model/constants/taskScreen';
import type { TaskScreenTab } from '../../model/constants/taskScreen';
import { useSubtaskScreen } from '../../model/hooks/useSubtaskScreen';
import { ActivityTab } from '../ActivityTab';
import { DatesSheet } from '../DatesSheet';
import { DiffText, plainField } from '../DiffText';
import { OptionSheet } from '../OptionSheet';
import { SubtaskAiScreen } from '../SubtaskAiScreen';
import { TaskChips } from '../TaskChips';
import { TaskMenuSheet } from '../TaskMenuSheet';
import { TaskStatusIcon } from '../TaskStatusIcon';
import styles from './SubtaskScreen.module.css';

const STATUS_VALUES: readonly TaskDetailsStatus[] = ['active', 'done'];
const TAB_ORDER = TASK_SCREEN_TABS.map((item) => item.value);

interface SubtaskScreenProps {
  isOpen: boolean;
  root: Task;
  subtaskId: string;
  isRouteExit?: boolean;
  onOpenParent: () => void;
  onOpenChild: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onChange: (id: string, patch: SubtaskPatch) => void;
  onDuplicate: (id: string) => boolean;
  onDelete: (id: string) => void;
  onRestore: (snapshot: Task['subtasks']) => void;
  onClose: () => void;
}

export function SubtaskScreen({
  isOpen,
  root,
  subtaskId,
  isRouteExit = false,
  onOpenParent,
  onOpenChild,
  onAddChild,
  onChange,
  onDuplicate,
  onDelete,
  onRestore,
  onClose,
}: SubtaskScreenProps) {
  const screen = useSubtaskScreen(root, subtaskId, {
    onChange,
    onDuplicate,
    onDelete,
    onRestore,
    onClose,
  });
  const { task, parent, tab, setTab, sheet, openSheet, closeSheet, patch } = screen;
  const shiftStore = useTabShiftStore<TaskScreenTab>();
  const isDiff = useTaskDiff() !== null;
  const kind = useDiffKind(subtaskId);
  const sheetOpener = (name: 'status' | 'dates' | 'priority') =>
    isDiff ? undefined : () => openSheet(name);

  const statusOptions = STATUS_VALUES.map((value) => ({
    value,
    label: TASK_STATUS_LABELS[value],
    leading: <TaskStatusIcon status={value} />,
  }));

  const renderTab = (value: TaskScreenTab) => {
    if (!task || !parent) return null;

    if (value === 'activity') {
      return (
        <TaskPatchContext.Provider value={patch}>
          <ActivityTab task={task} />
        </TaskPatchContext.Provider>
      );
    }

    return (
      <>
        <div className={styles.head}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon}>
              <SubtaskIcon width={26} height={26} />
            </span>
            <div className={styles.titleText}>
              {isDiff ? (
                <DiffText field={plainField(task.title)} variant="title" kind={kind} />
              ) : (
                <EditableText
                  variant="title"
                  label="Назва підзавдання"
                  value={task.title}
                  required
                  onSave={screen.saveTitle}
                />
              )}
            </div>
          </div>
          <TaskChips
            task={task}
            status={screen.status}
            category={screen.category}
            onOpenStatus={sheetOpener('status')}
            onOpenDates={sheetOpener('dates')}
            onOpenPriority={sheetOpener('priority')}
          />
        </div>

        <div className={styles.description}>
          {isDiff ? (
            <DiffText
              field={plainField(task.description ?? '')}
              variant="description"
              placeholder="Без опису"
            />
          ) : (
            <EditableText
              variant="description"
              label="Опис підзавдання"
              placeholder="Додайте опис…"
              value={task.description ?? ''}
              onSave={screen.saveDescription}
            />
          )}
        </div>

        <div className={styles.block}>
          <SubtasksBlock
            task={root}
            parentId={subtaskId}
            onOpen={onOpenChild}
            onAdd={() => onAddChild(subtaskId)}
          />
        </div>

        <TaskPatchContext.Provider value={patch}>
          <div className={styles.block}>
            <ChecklistsSection task={task} />
          </div>
          <div className={styles.block}>
            <AttachmentsSection task={task} />
          </div>
        </TaskPatchContext.Provider>
      </>
    );

  };

  return (
    <>
      <SlideScreen
        isOpen={isOpen}
        title="Підзавдання"
        swipeToDismiss={tab === 'details' && sheet === null}
        marksRouteCommit={isRouteExit}
        onClose={onClose}
        action={
          task &&
          !isDiff && (
            <button
              type="button"
              className={styles.more}
              aria-label="Дії з підзавданням"
              aria-haspopup="dialog"
              onClick={() => openSheet('menu')}
            >
              <MoreIcon width={24} height={24} />
            </button>
          )
        }
      >
        {task && parent && (
          <div className={styles.screen}>
            <button
              type="button"
              className={styles.parent}
              aria-label={`Перейти до батьківського завдання: ${parent.title}`}
              onClick={onOpenParent}
            >
              <ArrowUpIcon width={22} height={22} />
              <span className={styles.parentLabel}>Батьківське завдання:</span>
              <span className={styles.parentTitle}>{parent.title}</span>
            </button>

            {!isDiff && (
              <Tabs
                variant="underline"
                ariaLabel="Розділи підзавдання"
                items={TASK_SCREEN_TABS}
                value={tab}
                shiftStore={shiftStore}
                onChange={setTab}
              />
            )}

            <TabPanel
              value={tab}
              order={TAB_ORDER}
              swipe={isDiff ? undefined : { onChange: setTab, renderPanel: renderTab, shiftStore }}
            >
              {renderTab(tab)}
            </TabPanel>
          </div>
        )}
      </SlideScreen>

      {task && (
        <>
          <OptionSheet
            isOpen={sheet === 'status'}
            title="Статус"
            options={statusOptions}
            value={screen.status}
            onSelect={screen.changeStatus}
            onClose={closeSheet}
          />
          <DatesSheet
            value={{
              date: task.date,
              endDate: task.endDate,
              startTime: task.startTime,
              endTime: task.endTime,
            }}
            isRecurring={false}
            bounds={screen.bounds}
            isOpen={sheet === 'dates'}
            onClose={closeSheet}
            onSave={screen.changeDates}
          />
          <TaskPrioritySheet
            isOpen={sheet === 'priority'}
            value={task.priority}
            onSelect={screen.changePriority}
            onClose={closeSheet}
          />
          <SubtaskAiScreen
            root={root}
            subtaskId={subtaskId}
            isOpen={sheet === 'ai'}
            onApply={screen.applyAiUpdate}
            onClose={closeSheet}
          />
          <TaskMenuSheet
            task={task}
            kind="subtask"
            isOpen={sheet === 'menu'}
            view={screen.menuView}
            isRecurring={false}
            onClose={closeSheet}
            onViewChange={screen.setMenuView}
            onDuplicate={screen.handleDuplicate}
            onOpenAi={() => openSheet('ai')}
            onDelete={screen.handleDelete}
          />
        </>
      )}
    </>

  );
}