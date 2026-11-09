import type { useImportTaskUpdateJson } from '@/features/createItem';
import { JsonImportPanel } from '@/shared/ui/JsonImportPanel';
import { TaskDiffScreen } from '../TaskDiffScreen';

interface TaskAiPanelProps {
  state: ReturnType<typeof useImportTaskUpdateJson>;
  title: string;
  lead: string;
  submitLabel: string;
  promptDescription: string;
  inputDescription: string;
}

export function TaskAiPanel({
  state,
  title,
  lead,
  submitLabel,
  promptDescription,
  inputDescription,
}: TaskAiPanelProps) {
  const { raw, error, prompt, isSubmitting, buildPreview, buildDiff, handleChange, handleImport } =
    state;

  return (
    <JsonImportPanel
      value={raw}
      prompt={prompt}
      error={error}
      isSubmitting={isSubmitting}
      title={title}
      lead={lead}
      submitLabel={submitLabel}
      promptDescription={promptDescription}
      inputDescription={inputDescription}
      inputPreviewLabel="Прев’ю змін"
      buildInputPreview={buildPreview}
      renderInputPreview={({ isOpen, onClose: closePreview }) => {
        const result = buildDiff(raw);
        return result.ok ? (
          <TaskDiffScreen isOpen={isOpen} diff={result.value} onClose={closePreview} />
        ) : null;
      }}
      onChange={handleChange}
      onSubmit={() => void handleImport()}
    />
  );
}