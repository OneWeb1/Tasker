import type { Workspace } from '@/entities/workspace';
import { useImportPlanJson } from '@/features/createItem';
import { JsonImportPanel } from '@/shared/ui/JsonImportPanel';
import { SlideScreen } from '@/shared/ui/SlideScreen';

interface PlanImportFormProps {
  activeWorkspace: Workspace;
  onImported: (workspaceId: string) => void;
}

function PlanImportForm({ activeWorkspace, onImported }: PlanImportFormProps) {
  const { raw, error, prompt, isSubmitting, handleChange, handleImport } = useImportPlanJson(
    activeWorkspace,
    onImported,
  );

  return (
    <JsonImportPanel
      value={raw}
      prompt={prompt}
      error={error}
      isSubmitting={isSubmitting}
      onChange={handleChange}
      onSubmit={() => void handleImport()}
    />
  );
}

interface PlanImportScreenProps {
  isOpen: boolean;
  activeWorkspace: Workspace;
  onClose: () => void;
  onImported: (workspaceId: string) => void;
}

export function PlanImportScreen({
  isOpen,
  activeWorkspace,
  onClose,
  onImported,
}: PlanImportScreenProps) {
  return (
    <SlideScreen isOpen={isOpen} title="Імпорт плану з ШІ" onClose={onClose}>
      <PlanImportForm activeWorkspace={activeWorkspace} onImported={onImported} />
    </SlideScreen>
  );
}