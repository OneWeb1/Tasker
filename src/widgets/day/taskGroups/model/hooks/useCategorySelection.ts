import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_CATEGORY_ID } from '@/entities/category';
import type { Category } from '@/entities/category';
import { useCategoryClipboard } from '@/features/category/clipboardCategories';
import { useToast } from '@/shared/ui/Toast';

interface UseCategorySelectionParams {
  categories: readonly Category[];
  workspaceId: string;
}

export function useCategorySelection({ categories, workspaceId }: UseCategorySelectionParams) {
  const { copyCategories, cutCategories } = useCategoryClipboard();
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string> | null>(null);

  const selectedCategories = useMemo(
    () => (selectedIds ? categories.filter((category) => selectedIds.has(category.id)) : []),
    [categories, selectedIds],
  );
  const cuttableCategories = useMemo(
    () => selectedCategories.filter((category) => category.id !== DEFAULT_CATEGORY_ID),
    [selectedCategories],
  );

  const start = useCallback((id: string) => setSelectedIds(new Set([id])), []);
  const cancel = useCallback(() => setSelectedIds(null), []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((current) => {
      if (!current) return current;
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSelected = useCallback((id: string) => selectedIds?.has(id) ?? false, [selectedIds]);

  const handleCopy = useCallback(() => {
    const targets = selectedCategories;
    cancel();
    if (targets.length === 0) return;
    copyCategories(targets, workspaceId);
    showToast({ message: `Скопійовано категорій: ${targets.length}` });
  }, [cancel, copyCategories, selectedCategories, showToast, workspaceId]);

  const handleCut = useCallback(() => {
    const targets = cuttableCategories;
    cancel();
    if (targets.length === 0) return;
    cutCategories(targets, workspaceId);
    showToast({ message: `Вирізано категорій: ${targets.length}` });
  }, [cancel, cutCategories, cuttableCategories, showToast, workspaceId]);

  return {
    isActive: selectedIds !== null,
    isSelected,
    start,
    cancel,
    toggle,
    bar: {
      isActive: selectedIds !== null,
      count: selectedCategories.length,
      hasSelection: selectedCategories.length > 0,
      canCut: cuttableCategories.length > 0,
      onCancel: cancel,
      onCopy: handleCopy,
      onCut: handleCut,
    },
  };
}