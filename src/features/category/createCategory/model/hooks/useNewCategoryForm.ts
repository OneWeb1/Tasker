import { useState } from 'react';
import { CATEGORY_EMOJIS, CATEGORY_TITLE_MAX_LENGTH } from '@/entities/category';
import type { Category, CategoryColor } from '@/entities/category';
import { isDuplicateCategoryTitle } from '../lib/isDuplicateCategoryTitle';
import { pickFreeCategoryColor } from '../lib/pickFreeCategoryColor';
import { useCreateCategory } from './useCreateCategory';

type SubmitStatus = 'idle' | 'submitting' | 'error';

export function useNewCategoryForm(
  categories: readonly Category[],
  workspaceId: string,
  onCreated: (category: Category) => void,
) {
  const { submitCategory } = useCreateCategory();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState<string>(CATEGORY_EMOJIS[0] ?? '🎯');
  const [color, setColor] = useState<CategoryColor>(() => pickFreeCategoryColor(categories));
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const trimmedTitle = title.trim();
  const isDuplicate = isDuplicateCategoryTitle(categories, trimmedTitle);
  const isValid =
    trimmedTitle !== '' && trimmedTitle.length <= CATEGORY_TITLE_MAX_LENGTH && !isDuplicate;
  const isSubmitting = status === 'submitting';

  const handleCreate = async () => {
    if (!isValid || isSubmitting) return;

    setStatus('submitting');
    try {
      const created = await submitCategory({ title: trimmedTitle, emoji, color, workspaceId });
      onCreated(created);
    } catch {
      setStatus('error');
    }
  };

  return {
    title,
    setTitle,
    emoji,
    setEmoji,
    color,
    setColor,
    isDuplicate,
    isValid,
    isSubmitting,
    hasError: status === 'error',
    handleCreate,
  };
}