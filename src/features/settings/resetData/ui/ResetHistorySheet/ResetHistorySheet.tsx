import { useState } from 'react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import type { useResetHistory } from '../../model/hooks/useResetHistory';
import styles from './ResetHistorySheet.module.css';

type History = ReturnType<typeof useResetHistory>;
type View = { kind: 'list' } | { kind: 'restore'; id: string } | { kind: 'clear' };

interface ResetHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  history: History;
}

const LIST_VIEW: View = { kind: 'list' };

export function ResetHistorySheet({ isOpen, onClose, history }: ResetHistorySheetProps) {
  const { items, errorMessage, restore, remove, clear, dismissError } = history;
  const [view, setView] = useState<View>(LIST_VIEW);

  const backToList = () => {
    dismissError();
    setView(LIST_VIEW);
  };
  const handleClose = () => (view.kind === 'list' ? onClose() : backToList());

  const pending = view.kind === 'restore' ? items.find((item) => item.id === view.id) : undefined;

  let title = 'Історія скидань';
  if (view.kind === 'restore') title = 'Відновити копію?';
  if (view.kind === 'clear') title = 'Очистити історію?';

  return (
    <BottomSheet
      isOpen={isOpen}
      title={title}
      onClose={handleClose}
      onBack={view.kind === 'list' ? undefined : backToList}
    >
      {view.kind === 'list' && (
        <div className={styles.content}>
          {items.length === 0 ? (
            <p className={styles.empty}>
              Історія порожня. Копії з’являються автоматично перед скиданням даних.
            </p>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.info}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemMeta}>{item.reasonLabel}</span>
                    <span className={styles.itemMeta}>{item.summary}</span>
                  </div>
                  <div className={styles.actions}>
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={() => setView({ kind: 'restore', id: item.id })}
                    >
                      Відновити
                    </Button>
                    <Button variant="ghost" fullWidth onClick={() => remove(item.id)}>
                      Видалити
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <Button variant="danger" fullWidth onClick={() => setView({ kind: 'clear' })}>
              Очистити історію
            </Button>
          )}
        </div>
      )}

      {view.kind === 'restore' && (
        <div className={styles.content}>
          <p className={styles.text}>
            Поточні дані буде замінено даними з копії від {pending?.title}. Перед відновленням
            поточний стан збережеться як нова копія, тож відновлення можна скасувати.
          </p>
          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}
          <div className={styles.confirmActions}>
            <Button variant="ghost" fullWidth onClick={backToList}>
              Скасувати
            </Button>
            <Button variant="danger" fullWidth onClick={() => restore(view.id)}>
              Відновити
            </Button>
          </div>
        </div>
      )}

      {view.kind === 'clear' && (
        <div className={styles.content}>
          <p className={styles.text}>
            Усі збережені копії буде видалено назавжди. Відновити дані з них буде неможливо.
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" fullWidth onClick={backToList}>
              Скасувати
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                clear();
                setView(LIST_VIEW);
              }}
            >
              Очистити
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>

  );
}