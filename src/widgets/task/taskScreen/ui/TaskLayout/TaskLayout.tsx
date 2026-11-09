import type { ReactNode } from 'react';
import { SubtaskIcon } from '@/shared/ui/icons';
import styles from './TaskLayout.module.css';

export function TaskBody({ children }: { children: ReactNode }) {
  return <div className={styles.screen}>{children}</div>;
}

interface TaskHeadProps {
  title: ReactNode;
  children?: ReactNode;
}

export function TaskHead({ title, children }: TaskHeadProps) {
  return (
    <div className={styles.head}>
      <div className={styles.titleRow}>
        <span className={styles.titleIcon}>
          <SubtaskIcon width={26} height={26} />
        </span>
        <div className={styles.titleText}>{title}</div>
      </div>
      {children}
    </div>
  );
}

export function TaskDescription({ children }: { children: ReactNode }) {
  return <div className={styles.description}>{children}</div>;
}

export function TaskBlock({ children }: { children: ReactNode }) {
  return <div className={styles.block}>{children}</div>;
}