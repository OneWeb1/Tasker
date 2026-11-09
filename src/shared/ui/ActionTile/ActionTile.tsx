import type { ReactNode } from 'react';
import styles from './ActionTile.module.css';

interface ActionTileProps {
  icon: ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  onClick: () => void;
}

export function ActionTile({
  icon,
  label,
  variant = 'default',
  disabled = false,
  onClick,
}: ActionTileProps) {
  return (
    <button
      type="button"
      className={styles.tile}
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.surface}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}