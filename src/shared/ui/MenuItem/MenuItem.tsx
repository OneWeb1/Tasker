import type { ReactNode } from 'react';
import styles from './MenuItem.module.css';

interface MenuItemProps {
  icon?: ReactNode;
  label: string;
  trailing?: ReactNode;
  variant?: 'default' | 'danger';
  isSelected?: boolean;
  onClick: () => void;
}

export function MenuItem({
  icon,
  label,
  trailing,
  variant = 'default',
  isSelected,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      className={styles.item}
      data-variant={variant}
      data-selected={isSelected}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{label}</span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </button>
  );
}