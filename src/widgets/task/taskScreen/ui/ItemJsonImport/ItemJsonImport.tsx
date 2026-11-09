import { useImportItemJson } from '@/features/createItem';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { JsonImportPanel } from '@/shared/ui/JsonImportPanel';

interface ItemJsonImportProps {
  defaultDate: string;
}

export function ItemJsonImport({ defaultDate }: ItemJsonImportProps) {
  const { workspace } = useActiveWorkspace();
  const { raw, error, prompt, isSubmitting, handleChange, handleImport } = useImportItemJson(
    defaultDate,
    workspace.id,
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