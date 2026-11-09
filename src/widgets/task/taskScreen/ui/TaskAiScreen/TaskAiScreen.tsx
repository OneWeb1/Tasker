import type { Task } from '@/entities/task';
import { useImportTaskUpdateJson } from '@/features/createItem';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { TaskAiPanel } from '../TaskAiPanel';

const TITLE = 'Покращення через ШІ';

interface TaskAiContentProps {
  task: Task;
  onClose: () => void;
}

function TaskAiContent({ task, onClose }: TaskAiContentProps) {
  const state = useImportTaskUpdateJson(task, onClose);

  return (
    <TaskAiPanel
      state={state}
      title={TITLE}
      lead="Надішліть ШІ поточне завдання, щоб він доповнив або покращив його, а потім застосуйте результат."
      submitLabel="Оновити завдання"
      promptDescription="Скопіюйте промпт із поточним завданням і надішліть його ШІ. Опишіть, що саме покращити чи доповнити: опис, підзавдання, чекліст, терміни."
      inputDescription="Скопіюйте оновлене завдання від ШІ та натисніть «Вставити JSON». Перед застосуванням можна переглянути, що саме зміниться в завданні."
    />
  );
}

interface TaskAiScreenProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskAiScreen({ task, isOpen, onClose }: TaskAiScreenProps) {
  return (
    <SlideScreen isOpen={isOpen} title={TITLE} onClose={onClose}>
      <TaskAiContent task={task} onClose={onClose} />
    </SlideScreen>
  );
}