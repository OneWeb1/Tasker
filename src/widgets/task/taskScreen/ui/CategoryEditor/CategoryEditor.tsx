import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  CATEGORY_TITLE_MAX_LENGTH,
  CategoryColorPicker,
  CategoryEmojiPicker,
  getCategoryColorStyle,
} from '@/entities/category';
import type { Category } from '@/entities/category';
import { useNewCategoryForm } from '@/features/category/createCategory';
import { TITLE_FOCUS_DELAY_MS } from '@/features/createItem';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { EditableText } from '@/shared/ui/EditableText';
import chipStyles from '../TaskChips/TaskChips.module.css';
import styles from './CategoryEditor.module.css';

interface CategoryEditorProps {
  categories: readonly Category[];
  workspaceId: string;
  onCreated: (category: Category) => void;
}

export function CategoryEditor({ categories, workspaceId, onCreated }: CategoryEditorProps) {
  const {
    title,
    setTitle,
    emoji,
    setEmoji,
    color,
    setColor,
    isDuplicate,
    isValid,
    isSubmitting,
    hasError,
    handleCreate,
  } = useNewCategoryForm(categories, workspaceId, onCreated);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);

  const selectEmoji = (value: string) => {
    setEmoji(value);
    setIsEmojiOpen(false);
  };



  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handleCreate();
  };

  return (
    <>
      <div className={styles.screen}>
        <div className={styles.head}>
          <EditableText
            variant="title"
            label="Назва категорії"
            placeholder="Назва категорії"
            value={title}
            maxLength={CATEGORY_TITLE_MAX_LENGTH}
            autoFocusDelay={TITLE_FOCUS_DELAY_MS}
            onChange={setTitle}
            onSave={setTitle}
          />
          <div className={chipStyles.chips}>
            <div className={chipStyles.row}>
              <span className={chipStyles.label}>Іконка</span>
              <button
                type="button"
                className={chipStyles.chip}
                aria-haspopup="dialog"
                onClick={() => setIsEmojiOpen(true)}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            </div>
            <div className={chipStyles.row}>
              <span className={chipStyles.label}>Колір</span>
              <button
                type="button"
                className={chipStyles.chip}
                aria-haspopup="dialog"
                onClick={() => setIsColorOpen(true)}
              >
                <span
                  className={styles.dot}
                  data-color={color}
                  style={getCategoryColorStyle(color)}
                  aria-hidden="true"
                />
                {color.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {isDuplicate && (
          <p className={styles.error} role="alert">
            Така категорія вже є
          </p>
        )}
        {hasError && (
          <p className={styles.error} role="alert">
            Не вдалося зберегти. Спробуйте ще раз.
          </p>
        )}

        <form className={styles.footer} onSubmit={handleSubmit}>
          <Button type="submit" fullWidth disabled={!isValid || isSubmitting}>
            Створити
          </Button>
        </form>
      </div>

      <BottomSheet isOpen={isEmojiOpen} title="Іконка" onClose={() => setIsEmojiOpen(false)}>
        <CategoryEmojiPicker value={emoji} onChange={selectEmoji} />
      </BottomSheet>
      <BottomSheet isOpen={isColorOpen} title="Колір" onClose={() => setIsColorOpen(false)}>
        <CategoryColorPicker value={color} onChange={setColor} />
      </BottomSheet>
    </>
  );
}