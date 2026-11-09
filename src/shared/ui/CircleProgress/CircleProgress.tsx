import type { ReactNode } from 'react';
import styles from './CircleProgress.module.css';

interface CircleProgressProps {
  percent: number;
  children?: ReactNode;
  className?: string;
}

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

export function CircleProgress({ percent, children, className }: CircleProgressProps) {
  const value = clampPercent(percent);

  return (
    <span className={[styles.root, className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg className={styles.svg} viewBox="0 0 40 40">
        <circle className={styles.track} cx="20" cy="20" r="16" />
        <circle
          className={styles.indicator}
          data-empty={value === 0}
          cx="20"
          cy="20"
          r="16"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - value}
        />
      </svg>
      {children && <span className={styles.content}>{children}</span>}
    </span>
  );
}