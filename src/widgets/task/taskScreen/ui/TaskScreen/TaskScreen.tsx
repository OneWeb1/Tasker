import { useEffect, useRef, useState } from 'react';
import { TaskPrioritySheet } from '@/entities/task';
import type { TaskDetailsStatus } from '@/entities/task';
import { resolveWorkspaceId } from '@/entities/workspace';
import { AttachmentsSection } from '@/features/task/attachments';
import { ChecklistsSection } from '@/features/task/checklists';
import { TaskTimerControl } from '@/features/task/taskTimer';
import { useEdgeSwipe } from '@/shared/lib/hooks/useEdgeSwipe';
import { useTabShiftStore } from '@/shared/lib/hooks/useTabShift';
import { EditableText } from '@/shared/ui/EditableText';
import { TabPanel } from '@/shared/ui/TabPanel';
import { Tabs } from '@/shared/ui/Tabs';
import { SubtaskIcon } from '@/shared/ui/icons';
import { TASK_SCREEN_TABS, TASK_STATUS_LABELS } from '../../model/constants/taskScreen';
import type { TaskScreenTab } from '../../model/constants/taskScreen';
import { useTaskScreen } from '../../model/hooks/useTaskScreen';
import { ActivityTab } from '../ActivityTab';
import { DatesSheet } from '../DatesSheet';
import { OptionSheet } from '../OptionSheet';
import { SubtasksPanel } from '../SubtasksPanel';
import { TaskAiScreen } from '../TaskAiScreen';
import { TaskChips } from '../TaskChips';
import { TaskMenuSheet } from '../TaskMenuSheet';
import { TaskNotesSection } from '../TaskNotesSection';
import { TaskStatusIcon } from '../TaskStatusIcon';
import { TaskTopBar } from '../TaskTopBar';
import styles from './TaskScreen.module.css';

const ONCE_STATUSES: readonly TaskDetailsStatus[] = ['active', 'done', 'postponed'];
const RECURRING_STATUSES: readonly TaskDetailsStatus[] = ['active', 'done'];
const TAB_ORDER = TASK_SCREEN_TABS.map((item) => item.value);

interface TaskScreenProps {
  taskId: string;
  subtaskId?: string;
  isEmbedded?: boolean;
}

export function TaskScreen({ taskId, subtaskId, isEmbedded = false }: TaskScreenProps) {
  const {
    task,
    isNotFound,
    category,
    project,
    workspace,
    workspaces,
    details,
    dateKey,
    isRecurring,
    isMovable,
    tab,
    setTab,
    sheet,
    openSheet,
    closeSheet,
    menuView,
    setMenuView,
    goBack,
    saveTitle,
   saveDescription,
   changeStatus,
   applyPendingStatus,
   changePriority,
   changeDates,
   changeWorkspace,
   handleEdit,
   handleDuplicate,
   handleMoveTomorrow,
   handleDelete,
   } = useTaskScreen(taskId);
  const shiftStore = useTabShiftStore<TaskScreenTab>();
  const screenRef = useRef<HTMLDivElement>(null);
  const [isBodyReady, setIsBodyReady] = useState(false);
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setIsBodyReady(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);
  useEdgeSwipe({
    onSwipe: goBack,
    targetRef: screenRef,
    showBackdrop: true,
    isActive: !isEmbedded && !subtaskId,
    isEnabled: !isEmbedded && tab === 'details' && sheet === null,
  });

  if (subtaskId) {
    return task ? (
      <SubtasksPanel
        task={task}
        isHeadless
        initialSubtaskId={subtaskId}
        onInitialClosed={goBack}
        renderRoot={() => <TaskScreen taskId={task.id} isEmbedded />}
      />
    ) : null;
  }

  const statusOptions = (isRecurring ? RECURRING_STATUSES : ONCE_STATUSES).map((value) => ({
    value,
    label: TASK_STATUS_LABELS[value],
        leading: <TaskStatusIcon status={value} />,
  }));

  const workspaceOptions = workspaces.map((item) => ({
    value: item.id,
    label: item.title,
    leading: <span aria-hidden="true">{item.emoji}</span>,
  }));

  const renderTab = (value: TaskScreenTab) => {
    if (!task || !details) return null;

    if (value === 'activity') return <ActivityTab task={task} />;

    return (
      <>
        <div className={styles.head}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon}>
              <SubtaskIcon width={26} height={26} />
            </span>
            <div className={styles.titleText}>
              <EditableText
                variant="title"
                label="Назва завдання"
                value={task.title}
                required
                onSave={saveTitle}
              />
            </div>
          </div>
          <TaskChips
            task={task}
            status={details.status}
                        category={category}
            project={project}
            workspace={workspace}
            timer={<TaskTimerControl task={task} dateKey={dateKey} />}
            onOpenStatus={() => openSheet('status')}
            onOpenDates={() => openSheet('dates')}
            onOpenPriority={() => openSheet('priority')}
            onOpenWorkspace={() => openSheet('workspace')}
          />
        </div>
        <div className={styles.description}>
          <EditableText
            variant="description"
            label="Опис завдання"
            placeholder="Додайте опис…"
            value={task.description ?? ''}
            onSave={saveDescription}
          />
        </div>
        {isBodyReady && (
          <>
            <div className={styles.block}>
              <SubtasksPanel
                task={task}
                renderRoot={
                  isEmbedded ? undefined : () => <TaskScreen taskId={task.id} isEmbedded />
                }
              />
            </div>
            <div className={styles.block}>
              <ChecklistsSection task={task} />
            </div>
            <div className={styles.block}>
              <AttachmentsSection task={task} />
            </div>
            {!isEmbedded && (
              <div className={styles.block}>
                <TaskNotesSection
                  taskId={task.id}
                  workspaceId={resolveWorkspaceId(task.workspaceId)}
                />
              </div>
            )}
          </>
        )}
      </>
    );

  };

  return (
    <div ref={screenRef} className={styles.screen} data-embedded={isEmbedded || undefined}>
      <div className={styles.header}>
        {!isEmbedded && (
          <TaskTopBar onBack={goBack} onMore={task ? () => openSheet('menu') : undefined} />
        )}
        <Tabs
          variant="underline"
          ariaLabel="Розділи завдання"
          items={TASK_SCREEN_TABS}
          value={tab}
          shiftStore={shiftStore}
          onChange={setTab}
        />
      </div>

      {isNotFound && <p className={styles.empty}>Завдання не знайдено</p>}

      {task && details && (
        <TabPanel
          value={tab}
          order={TAB_ORDER}
          swipe={{ onChange: setTab, renderPanel: renderTab, shiftStore }}
        >
          {renderTab(tab)}
        </TabPanel>
      )}

      {task && details && (
        <>
          <OptionSheet
            isOpen={sheet === 'status'}
            title="Статус"
            options={statusOptions}
   value={details.status}
   onSelect={changeStatus}
   onClose={closeSheet}
   onExited={applyPendingStatus}
   />
          <OptionSheet
            isOpen={sheet === 'workspace'}
            title="Простір"
            options={workspaceOptions}
            value={workspace?.id ?? ''}
            onSelect={changeWorkspace}
            onClose={closeSheet}
          />
          <DatesSheet
            value={{
              date: task.date,
              endDate: task.endDate,
              startTime: task.startTime,
              endTime: task.endTime,
            }}
            isRecurring={isRecurring}
            isOpen={sheet === 'dates'}
            onClose={closeSheet}
            onSave={changeDates}
          />
          <TaskPrioritySheet
            isOpen={sheet === 'priority'}
            value={task.priority}
            onSelect={(priority) => changePriority(priority ?? 'none')}
            onClose={closeSheet}
          />
          <TaskAiScreen task={task} isOpen={sheet === 'ai'} onClose={closeSheet} />
          <TaskMenuSheet
            task={task}
            isOpen={sheet === 'menu'}
            view={menuView}
            isRecurring={isRecurring}
            onClose={closeSheet}
            onViewChange={setMenuView}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onOpenAi={() => openSheet('ai')}
            onMoveTomorrow={isMovable ? handleMoveTomorrow : undefined}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>

  );
}