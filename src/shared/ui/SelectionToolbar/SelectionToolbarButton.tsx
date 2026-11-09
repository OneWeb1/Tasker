import type { ReactNode } from 'react';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarButtonProps {
  label: string;
  variant?: 'close' | 'danger';
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function SelectionToolbarButton({
  label,
  variant,
  disabled,
  onClick,
  children,
}: SelectionToolbarButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      data-variant={variant}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}