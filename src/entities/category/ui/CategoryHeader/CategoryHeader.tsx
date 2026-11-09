import type { ReactNode } from 'react';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { CheckIcon, ChevronDownIcon } from '@/shared/ui/icons';
import { getCategoryColorStyle } from '../../lib/categoryColorStyle';
import type { Category } from '../../model/types/category';
import styles from './CategoryHeader.module.css';

interface CategoryProgress {
  done: number;
  total: number;
  percent: number;
}

interface CategoryHeaderProps {
  category: Category;
  actions?: ReactNode;
  progress?: CategoryProgress;
  isCollapsed?: boolean;
  isSelected?: boolean;
}

export function CategoryHeader({
  category,
  actions,
  progress,
  isCollapsed,
  isSelected,
}: CategoryHeaderProps) {
  return (
    <header
      className={styles.header}
      data-color={category.color}
      data-selected={isSelected || undefined}
      style={getCategoryColorStyle(category.color)}
    >
      <span className={styles.badge} aria-hidden="true">
        {isSelected ? <CheckIcon width={16} height={16} /> : category.emoji}
      </span>
      <h2 className={styles.title}>{category.title}</h2>
      {isCollapsed !== undefined && (
        <ChevronDownIcon
          className={styles.chevron}
          data-collapsed={isCollapsed}
          width={18}
          height={18}
          aria-hidden="true"
        />
      )}
      {actions}
      {progress && progress.total > 0 && (
        <div className={styles.progress}>
          <span className={styles.count}>
            {progress.done}/{progress.total} завдань
          </span>
          <span className={styles.bar}>
            <ProgressBar
              done={progress.done}
              total={progress.total}
              label={`Прогрес категорії ${category.title}`}
            />
          </span>
        </div>
      )}
    </header>
  );
}