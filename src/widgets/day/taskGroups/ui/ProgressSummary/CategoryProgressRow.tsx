import { useLayoutEffect, useRef, useState } from 'react';
import { getCategoryColorStyle } from '@/entities/category';
import type { Category } from '@/entities/category';
import type { TaskProgress } from '@/entities/task';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import styles from './ProgressSummary.module.css';

interface CategoryProgressRowProps {
  category: Category;
  progress: TaskProgress;
  isLeaving: boolean;
  isInitial: boolean;
}

export function CategoryProgressRow({
  category,
  progress,
  isLeaving,
  isInitial,
}: CategoryProgressRowProps) {
  const ref = useRef<HTMLLIElement>(null);
  const [isMounted, setIsMounted] = useState(isInitial);

  useLayoutEffect(() => {
    if (isMounted) return;
    void ref.current?.offsetHeight;
    setIsMounted(true);
  }, [isMounted]);

  return (
    <li
      ref={ref}
      className={styles.categoryItem}
      data-open={isMounted && !isLeaving}
      aria-hidden={isLeaving || undefined}
    >
      <div className={styles.categoryInner}>
        <div
          className={styles.category}
          data-color={category.color}
          style={getCategoryColorStyle(category.color)}
        >
          <div className={styles.categoryRow}>
            <span aria-hidden="true">{category.emoji}</span>
            <span className={styles.categoryTitle}>{category.title}</span>
            <span className={styles.categoryCount}>
              <AnimatedNumber value={progress.done} />/<AnimatedNumber value={progress.total} />
            </span>
          </div>
          <ProgressBar
            done={progress.done}
            total={progress.total}
            label={`Прогрес категорії ${category.title}`}
            animateOnMount={!isInitial}
          />
        </div>
      </div>
    </li>
  );
}