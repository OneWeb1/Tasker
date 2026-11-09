import type { FormEvent } from 'react';
import { WORKSPACE_TITLE_MAX_LENGTH } from '@/entities/workspace';
import type { Workspace } from '@/entities/workspace';
import { TITLE_FOCUS_DELAY_MS } from '@/features/createItem';
import { useRenameWorkspaceForm } from '@/features/workspace/renameWorkspace';
import { Button } from '@/shared/ui/Button';
import { focusTextOnTap } from '@/shared/lib/utils/focusTextOnTap';
import { EditableText } from '@/shared/ui/EditableText';
import styles from './WorkspaceSheet.module.css';

interface WorkspaceRenameFormProps {
  workspace: Workspace;
  workspaces: readonly Workspace[];
  onRenamed: () => void;
}

export function WorkspaceRenameForm({
  workspace,
  workspaces,
  onRenamed,
}: WorkspaceRenameFormProps) {
  const form = useRenameWorkspaceForm(workspace, workspaces, onRenamed);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.handleRename();
  };

  return (
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
      </div>

      {form.isDuplicate && (
        <p className={styles.createHint} role="alert">
          Простір з такою назвою вже існує
        </p>
      )}
      {form.hasError && (
        <p className={styles.createHint} role="alert">
          Не вдалося зберегти. Спробуйте ще раз.
        </p>
      )}

      <form className={styles.footer} onSubmit={handleSubmit}>
        <Button type="submit" fullWidth disabled={!form.isValid || form.isSubmitting}>
          Зберегти
        </Button>
      </form>
    </div>

  );
}