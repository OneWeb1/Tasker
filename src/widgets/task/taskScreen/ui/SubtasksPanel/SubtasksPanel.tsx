import type { ReactNode } from 'react';
import { findSubtaskParentId } from '@/entities/task';
import type { Task } from '@/entities/task';
import { SubtasksBlock, useSubtaskStack, useSubtasks } from '@/features/task/subtasks';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { useSubtaskCreateTarget } from '../../model/hooks/useSubtaskCreateTarget';
import { SubtaskCreateScreen } from '../SubtaskCreateScreen';
import { SubtaskScreen } from '../SubtaskScreen';

const ROOT_ID = '__task__';

interface SubtasksPanelProps {
  task: Task;
  initialSubtaskId?: string;
  isHeadless?: boolean;
  onInitialClosed?: () => void;
  renderRoot?: () => ReactNode;
}

export function SubtasksPanel({
  task,
  initialSubtaskId,
  isHeadless = false,
  onInitialClosed,
  renderRoot,
}: SubtasksPanelProps) {
  const { updateSubtask, removeSubtask, duplicateSubtask, restoreSubtasks } = useSubtasks(task);
  const { ids, depth, open, closeAt, closeAll } = useSubtaskStack(initialSubtaskId);
  const { create, openCreate, closeCreate } = useSubtaskCreateTarget();
  const subtasks = task.subtasks ?? [];
  const isRouteBound = Boolean(initialSubtaskId) && onInitialClosed !== undefined;

  const openParent = (id: string) => {
    const parentId = findSubtaskParentId(subtasks, id);
    if (parentId) open(parentId);
    else if (renderRoot) open(ROOT_ID);
    else closeAll();
  };

  const handleClose = (index: number) => {
    closeAt(index);
    if (index === 0 && isRouteBound) onInitialClosed?.();
  };

  return (
    <>
      {!isHeadless && <SubtasksBlock task={task} onOpen={open} onAdd={() => openCreate()} />}

      {ids.map((id, index) =>
        id === ROOT_ID && renderRoot ? (
          <SlideScreen
            key={`${index}:${id}`}
            isOpen={index < depth}
            title="Завдання"
            swipeToDismiss={false}
            onClose={() => handleClose(index)}
          >
            {renderRoot()}
          </SlideScreen>
        ) : (
          <SubtaskScreen
            key={`${index}:${id}`}
            isOpen={index < depth}
            root={task}
            subtaskId={id}
            isRouteExit={index === 0 && isRouteBound}
            onOpenParent={() => openParent(id)}
            onOpenChild={open}
            onAddChild={openCreate}
            onChange={updateSubtask}
            onDuplicate={duplicateSubtask}
            onDelete={removeSubtask}
            onRestore={restoreSubtasks}
            onClose={() => handleClose(index)}
          />
        ),
      )}

      {create && (
        <SubtaskCreateScreen
          key={create.token}
          isOpen={create.isOpen}
          root={task}
          parentId={create.parentId}
          renderSubtasks={(draftTask) => <SubtasksPanel task={draftTask} />}
          onClose={closeCreate}
        />
      )}
    </>

  );
}