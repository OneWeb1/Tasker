import type { ReactNode } from 'react';
import styles from './ChecklistHeading.module.css';

interface ChecklistHeadingProps {
  done: number;
  total: number;
  children: ReactNode;
}

export function ChecklistHeading({ done, total, children }: ChecklistHeadingProps) {
  return (
    <div className={styles.head}>
      {children}
      <span className={styles.count}>
        {done}/{total}
      </span>
    </div>
  );
}