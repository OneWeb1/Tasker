import type { ReactNode } from 'react';
import styles from './NavItem.module.css';

interface NavItemProps {
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export function NavItem({ label, icon, isActive, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      className={styles.item}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      onClick={onClick}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
    </button>
  );
}