import { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  done: number;
  total: number;
  label: string;
  animateOnMount?: boolean;
}

const SEGMENT_STAGGER_MS = 24;
const MAX_STAGGER_TOTAL_MS = 240;
const MAX_SEGMENTS = 12;

export function ProgressBar({ done, total, label, animateOnMount = false }: ProgressBarProps) {
  const [isMounted, setIsMounted] = useState(!animateOnMount);

  useEffect(() => {
    if (isMounted) return;
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  if (total <= 0) return null;

  const filled = isMounted ? Math.min(total, Math.max(0, done)) : 0;
  const step = Math.min(SEGMENT_STAGGER_MS, MAX_STAGGER_TOTAL_MS / total);
  const aria = {
    role: 'progressbar',
    'aria-label': label,
    'aria-valuemin': 0,
    'aria-valuemax': total,
    'aria-valuenow': Math.min(total, Math.max(0, done)),
  } as const;

  if (total > MAX_SEGMENTS) {
    return (
      <div className={styles.track} data-continuous="true" {...aria}>
        <span className={styles.fill} style={{ transform: `scaleX(${filled / total})` }} />
      </div>
    );
  }

  return (
    <div className={styles.track} {...aria}>
      {Array.from({ length: total }, (_, index) => {
        const isFilled = index < filled;
        const delay = (isFilled ? index : total - 1 - index) * step;
        return (
          <span
            key={index}
            className={styles.segment}
            data-filled={isFilled}
            style={{ transitionDelay: `${delay}ms` }}
          />
        );
      })}
    </div>
  );
}