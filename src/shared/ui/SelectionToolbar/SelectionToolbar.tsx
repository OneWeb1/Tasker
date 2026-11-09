import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/shared/ui/icons';
import { SelectionToolbarButton } from './SelectionToolbarButton';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarProps {
  ariaLabel: string;
  count: number;
  onCancel: () => void;
  children: ReactNode;
}

export function SelectionToolbar({ ariaLabel, count, onCancel, children }: SelectionToolbarProps) {
  return createPortal(
    <div className={styles.bar} role="toolbar" aria-label={ariaLabel}>
      <div className={styles.pill}>
        <SelectionToolbarButton label="Скасувати вибір" variant="close" onClick={onCancel}>
          <CloseIcon width={20} height={20} />
        </SelectionToolbarButton>
        <span className={styles.count} aria-live="polite">
          Вибрано: {count}
        </span>
        {children}
      </div>
    </div>,
    document.body,
  );
}