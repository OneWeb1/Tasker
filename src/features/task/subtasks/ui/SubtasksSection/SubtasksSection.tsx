import type { ReactNode } from 'react';
import { ArrowRightIcon, PlusIcon } from '@/shared/ui/icons';
import styles from './SubtasksSection.module.css';

interface SubtasksSectionProps {
  progress: { done: number; total: number } | null;
  onOpenAll: () => void;
  onAdd?: () => void;
  children?: ReactNode;
}

export function SubtasksSection({ progress, onOpenAll, onAdd, children }: SubtasksSectionProps) {
  return (
    <section className={styles.section} aria-label="Підзавдання">
      <button
        type="button"
        className={styles.header}
        aria-haspopup="dialog"
        aria-label="Відкрити підзавдання"
        onClick={onOpenAll}
      >
        <span className={styles.title}>Підзавдання</span>
        {progress && (
          <span className={styles.chip}>
            Виконано {progress.done}/{progress.total}
          </span>
        )}
        <ArrowRightIcon width={22} height={22} />
      </button>

      {children}

      {onAdd && (
        <button type="button" className={styles.add} aria-haspopup="dialog" onClick={onAdd}>
          <PlusIcon width={24} height={24} />
          Додати підзавдання
        </button>
      )}
    </section>
  );
}