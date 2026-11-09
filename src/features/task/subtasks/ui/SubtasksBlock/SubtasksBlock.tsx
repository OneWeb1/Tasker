import { useState } from 'react';
import { useTaskDiff } from '@/entities/task';
import type { Task } from '@/entities/task';
import { useSubtaskBulkActions } from '../../model/hooks/useSubtaskBulkActions';
import { useSubtaskSelection } from '../../model/hooks/useSubtaskSelection';
import { useSubtasks } from '../../model/hooks/useSubtasks';
import { SubtaskActionsBar } from '../SubtaskActionsBar';
import { SubtaskList } from '../SubtaskList';
import { SubtasksScreen } from '../SubtasksScreen';
import { SubtasksSection } from '../SubtasksSection';

interface SubtasksBlockProps {
  task: Task;
  parentId?: string;
  onOpen: (id: string) => void;
  onAdd: () => void;
}

export function SubtasksBlock({ task, parentId, onOpen, onAdd }: SubtasksBlockProps) {
  const subtasks = useSubtasks(task, parentId);
  const { openSubtasks, doneSubtasks, progress, toggleSubtask } = subtasks;
  const bulkActions = useSubtaskBulkActions(task.subtasks, subtasks);
  const [isScreenOpen, setIsScreenOpen] = useState(false);
  const isReadOnly = useTaskDiff() !== null;
  const { selection, bar, reset } = useSubtaskSelection(
    openSubtasks,
    isReadOnly ? undefined : bulkActions,
  );
  const handleToggle = isReadOnly ? undefined : toggleSubtask;
  const handleAdd = isReadOnly ? undefined : onAdd;

  const handleOpenAll = () => {
    reset();
    setIsScreenOpen(true);
  };

  return (
    <SubtasksSection progress={progress} onOpenAll={handleOpenAll} onAdd={handleAdd}>
      {openSubtasks.length > 0 && (
        <SubtaskList
          items={openSubtasks}
          selection={selection}
          onToggle={handleToggle}
          onOpen={onOpen}
        />
      )}

      <SubtasksScreen
        isOpen={isScreenOpen}
        openSubtasks={openSubtasks}
        doneSubtasks={doneSubtasks}
        bulkActions={isReadOnly ? undefined : bulkActions}
        onToggle={handleToggle}
        onOpen={onOpen}
        onAdd={handleAdd}
        onClose={() => setIsScreenOpen(false)}
      />

      {bar && <SubtaskActionsBar {...bar} />}
    </SubtasksSection>

  );
}