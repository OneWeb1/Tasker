import { useState } from 'react';
import type { Workspace } from '@/entities/workspace';
import { Button } from '@/shared/ui/Button';
import styles from './WorkspaceSheet.module.css';

type DeleteStatus = 'idle' | 'deleting' | 'error';

interface WorkspaceDeleteConfirmProps {
  workspace: Workspace;
  onCancel: () => void;
  onConfirm: () => Promise<boolean>;
}

export function WorkspaceDeleteConfirm({
  workspace,
  onCancel,
  onConfirm,
}: WorkspaceDeleteConfirmProps) {
  const [status, setStatus] = useState<DeleteStatus>('idle');

  const handleConfirm = async () => {
    if (status === 'deleting') return;

    setStatus('deleting');
    const isDeleted = await onConfirm();
    if (!isDeleted) setStatus('error');
  };

  return (
    <div className={styles.confirm}>
      <p className={styles.confirmText}>
        Простір «{workspace.title}» буде видалено назавжди разом з усіма його проєктами, категоріями
        та завданнями. Цю дію не можна відмінити.
      </p>
      {status === 'error' && (
        <p className={styles.hint} role="alert">
          Не вдалося видалити простір
        </p>
      )}
      <div className={styles.confirmActions}>
        <Button variant="ghost" fullWidth onClick={onCancel}>
          Скасувати
        </Button>
        <Button
          variant="danger"
          fullWidth
          disabled={status === 'deleting'}
          onClick={() => void handleConfirm()}
        >
          Видалити
        </Button>
      </div>
    </div>
  );
}