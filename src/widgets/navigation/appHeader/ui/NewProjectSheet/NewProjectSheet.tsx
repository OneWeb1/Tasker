import { useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CategoryEmojiPicker } from '@/entities/category';
import { PROJECT_TITLE_MAX_LENGTH } from '@/entities/project';
import type { Project } from '@/entities/project';
import { TITLE_FOCUS_DELAY_MS } from '@/features/createItem';
import { useNewProjectForm } from '@/features/project/createProject';
import { focusTextOnTap } from '@/shared/lib/utils/focusTextOnTap';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { EditableText } from '@/shared/ui/EditableText';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import styles from './NewProjectSheet.module.css';

interface NewProjectFormProps {
  projects: readonly Project[];
  workspaceId: string;
  onCreated: () => void;
}

function NewProjectForm({ projects, workspaceId, onCreated }: NewProjectFormProps) {
  const form = useNewProjectForm(projects, workspaceId, onCreated);
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
            label="Назва проєкту"
            placeholder="Назва проєкту"
            value={form.title}
            maxLength={PROJECT_TITLE_MAX_LENGTH}
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
          <p className={styles.hint} role="alert">
            Проєкт з такою назвою вже існує
          </p>
        )}
        {form.hasError && (
          <p className={styles.hint} role="alert">
            Не вдалося створити проєкт
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

interface NewProjectSheetProps {
  isOpen: boolean;
  projects: readonly Project[];
  workspaceId: string;
  onClose: () => void;
}

export function NewProjectSheet({ isOpen, projects, workspaceId, onClose }: NewProjectSheetProps) {
  return createPortal(
    <SlideScreen isOpen={isOpen} title="Новий проєкт" onClose={onClose}>
      <NewProjectForm projects={projects} workspaceId={workspaceId} onCreated={onClose} />
    </SlideScreen>,
    document.body,
  );
}