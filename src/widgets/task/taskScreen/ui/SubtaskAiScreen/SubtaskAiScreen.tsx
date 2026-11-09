import type { Task } from '@/entities/task';
import { useImportSubtaskUpdateJson } from '@/features/createItem';
import type { SubtaskUpdate } from '@/features/createItem';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { TaskAiPanel } from '../TaskAiPanel';

const TITLE = 'Покращення підзавдання';

interface SubtaskAiContentProps {
  root: Task;
  subtaskId: string;
  onApply: (patch: SubtaskUpdate) => void;
  onClose: () => void;
}

function SubtaskAiContent({ root, subtaskId, onApply, onClose }: SubtaskAiContentProps) {
  const state = useImportSubtaskUpdateJson(root, subtaskId, onApply, onClose);

  return (
    <TaskAiPanel
      state={state}
      title={TITLE}
      lead="Надішліть ШІ усе завдання як контекст — він покращить лише це підзавдання та його вміст."
      submitLabel="Оновити підзавдання"
      promptDescription="Скопіюйте промпт: він містить повне завдання верхнього рівня з усім вмістом і вказує, яке підзавдання змінювати. Опишіть, що саме покращити чи доповнити."
      inputDescription="Скопіюйте оновлене підзавдання від ШІ та натисніть «Вставити JSON». Перед застосуванням можна переглянути, що саме зміниться."
    />
  );
}

interface SubtaskAiScreenProps {
  root: Task;
  subtaskId: string;
  isOpen: boolean;
  onApply: (patch: SubtaskUpdate) => void;
  onClose: () => void;
}

export function SubtaskAiScreen({
  root,
  subtaskId,
  isOpen,
  onApply,
  onClose,
}: SubtaskAiScreenProps) {
  return (
    <SlideScreen isOpen={isOpen} title={TITLE} onClose={onClose}>
      <SubtaskAiContent root={root} subtaskId={subtaskId} onApply={onApply} onClose={onClose} />
    </SlideScreen>
  );
}