import { useState } from 'react';
import type { FormEvent } from 'react';
import { CategoryEmojiPicker } from '@/entities/category';
import { WORKSPACE_TITLE_MAX_LENGTH } from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';
import { TITLE_FOCUS_DELAY_MS } from '@/features/createItem';
import { useNewWorkspaceForm } from '@/features/workspace/createWorkspace';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { focusTextOnTap } from '@/shared/lib/utils/focusTextOnTap';
import { EditableText } from '@/shared/ui/EditableText';
import styles from './WorkspaceSheet.module.css';

interface WorkspaceCreateFormProps {
  workspaces: readonly Workspace[];
  onCreated: (workspace: Workspace) => void;
}

export function WorkspaceCreateForm({ workspaces, onCreated }: WorkspaceCreateFormProps) {
  const form = useNewWorkspaceForm(workspaces, onCreated);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const selectEmoji = (value: string) => {
    form.setEmoji(value);
    setIsEmojiOpen(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.handleCreate();
  };

  return (
    <>
      <div className={styles.create} onClick={focusTextOnTap}>
        <div className={styles.head}>
          <EditableText
            variant="title"
            label="Назва простору"
            placeholder="Назва простору"
            value={form.title}
            maxLength={WORKSPACE_TITLE_MAX_LENGTH}
            autoFocusDelay={TITLE_FOCUS_DELAY_MS}
            onChange={form.setTitle}
            onSave={form.setTitle}
          />
          <div className={styles.chipRow}>
            <span className={styles.chipLabel}>Іконка</span>
            <button
              type="button"
              className={styles.chip}
              aria-haspopup="dialog"
              onClick={() => setIsEmojiOpen(true)}
            >
              <span aria-hidden="true">{form.emoji}</span>
            </button>
          </div>
        </div>

        {form.isDuplicate && (
          <p className={styles.createHint} role="alert">
            Простір з такою назвою вже існує
          </p>
        )}
        {form.hasError && (
          <p className={styles.createHint} role="alert">
            Не вдалося створити простір
          </p>
        )}

        <form className={styles.footer} onSubmit={handleSubmit}>
          <Button type="submit" fullWidth disabled={!form.isValid || form.isSubmitting}>
            Створити
          </Button>
        </form>
      </div>

      <BottomSheet isOpen={isEmojiOpen} title="Іконка" onClose={() => setIsEmojiOpen(false)}>
        <CategoryEmojiPicker value={form.emoji} onChange={selectEmoji} />
      </BottomSheet>
    </>
  );
}