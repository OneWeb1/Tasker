import { useCallback, useState } from 'react';
import { clearStorage, flushStorage } from '@/shared/lib/utils/storage';
import { createBackup } from '../lib/backups';
import { reloadApp } from '../lib/reloadApp';

export function useResetData() {
  const [hasBackupError, setHasBackupError] = useState(false);

  const resetWithoutBackup = useCallback(() => {
    clearStorage();
    void reloadApp();
  }, []);

  const resetData = useCallback(() => {
    const run = async () => {
      try {
        createBackup('reset');
        await flushStorage();
      } catch {
        setHasBackupError(true);
        return;
      }
      resetWithoutBackup();
    };
    void run();
  }, [resetWithoutBackup]);

  const dismissBackupError = useCallback(() => setHasBackupError(false), []);

  return { resetData, resetWithoutBackup, hasBackupError, dismissBackupError };
}