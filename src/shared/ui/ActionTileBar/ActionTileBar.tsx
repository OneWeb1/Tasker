import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/shared/ui/icons';
import styles from './ActionTileBar.module.css';

interface ActionTileBarHeader {
  title: string;
  onCancel: () => void;
}

interface ActionTileBarProps {
  ariaLabel: string;
  header?: ActionTileBarHeader;
  children: ReactNode;
}

export function ActionTileBar({ ariaLabel, header, children }: ActionTileBarProps) {
  return createPortal(
    <div className={styles.bar} role="toolbar" aria-label={ariaLabel}>
      <div className={styles.panel}>
        {header && (
          <div className={styles.header}>
            <span className={styles.title} aria-live="polite">
              {header.title}
            </span>
            <button
              type="button"
              className={styles.close}
              aria-label="Скасувати вибір"
              onClick={header.onCancel}
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>
        )}
        <div className={styles.tiles}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}