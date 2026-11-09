import type { ReactNode } from 'react';
import { ArrowRightIcon } from '@/shared/ui/icons';
import styles from './ChecklistsSection.module.css';

interface ChecklistsViewProps {
  cards?: ReactNode;
  onOpenAll?: () => void;
  children?: ReactNode;
}

export function ChecklistsView({ cards, onOpenAll, children }: ChecklistsViewProps) {
  return (
    <section className={styles.section} aria-label="Чекліст">
      <div className={styles.header}>
        <h2 className={styles.title}>Чекліст</h2>
        {onOpenAll && (
          <button
            type="button"
            className={styles.openAll}
            aria-label="Відкрити чекліст"
            aria-haspopup="dialog"
            onClick={onOpenAll}
          >
            <ArrowRightIcon width={22} height={22} />
          </button>
        )}
      </div>

      {cards && <ul className={styles.cards}>{cards}</ul>}

      {children}
    </section>
  );
}