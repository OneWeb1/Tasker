import type { ReactNode } from 'react';
import styles from './MenuGroup.module.css';

interface MenuGroupProps {
  children: ReactNode;
}

export function MenuGroup({ children }: MenuGroupProps) {
  return (
    <div className={styles.group} data-menu-group="">
      {children}
    </div>
  );
}