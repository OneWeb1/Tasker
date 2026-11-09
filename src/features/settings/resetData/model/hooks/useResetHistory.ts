import { useCallback, useMemo, useState } from 'react';
import { clearBackups, readBackups, removeBackup, restoreBackup } from '../lib/backups';
import type { Backup } from '../lib/backups';
import { reloadApp } from '../lib/reloadApp';

const DATE_FORMAT = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long', timeStyle: 'short' });

const ERROR_MESSAGES = {
  invalid: 'Копія пошкоджена й не може бути відновлена.',
  noSpace:
    'Не вдалося зберегти поточний стан перед відновленням. Видаліть старі копії й спробуйте ще раз.',
  failed: 'Не вдалося відновити дані. Поточні дані не змінено.',
} as const;

export function useResetHistory() {
  const [backups, setBackups] = useState<Backup[]>(readBackups);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const items = useMemo(
    () =>
      backups.map((backup) => ({
        id: backup.id,
        title: DATE_FORMAT.format(backup.createdAt),
        reasonLabel: backup.reason === 'restore' ? 'Перед відновленням' : 'Перед скиданням',
        summary: `Завдань: ${backup.stats.tasks} · Категорій: ${backup.stats.categories} · Нотаток: ${backup.stats.notes}`,
      })),
    [backups],
  );

  const restore = useCallback(
    (id: string) => {
      const backup = backups.find((item) => item.id === id);
      if (!backup) return;

      const run = async () => {
        const result = await restoreBackup(backup);
        if (result === 'ok') {
          await reloadApp();
          return;
        }
        setErrorMessage(ERROR_MESSAGES[result]);
        setBackups(readBackups());
      };
      void run();
    },
    [backups],

  );

  const remove = useCallback((id: string) => {
    removeBackup(id);
    setBackups(readBackups());
  }, []);

  const clear = useCallback(() => {
    clearBackups();
    setBackups([]);
  }, []);

  const dismissError = useCallback(() => setErrorMessage(null), []);

  return { items, errorMessage, restore, remove, clear, dismissError };
}