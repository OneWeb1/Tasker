import type { Category } from '@/entities/category';
import { useImportCategoryJson } from '@/features/category/createCategory';
import { JsonImportPanel } from '@/shared/ui/JsonImportPanel';

interface CategoryJsonImportProps {
  categories: readonly Category[];
  workspaceId: string;
  onCreated: (category: Category) => void;
}

export function CategoryJsonImport({
  categories,
  workspaceId,
  onCreated,
}: CategoryJsonImportProps) {
  const { raw, error, prompt, isSubmitting, handleChange, handleImport } =
    useImportCategoryJson(categories, workspaceId, onCreated);

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