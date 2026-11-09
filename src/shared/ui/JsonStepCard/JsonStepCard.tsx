import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDownIcon } from '@/shared/ui/icons';
import styles from './JsonStepCard.module.css';

interface JsonStepCardProps {
  step: number;
  title: string;
  description: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function JsonStepCard({ step, title, description, children, actions }: JsonStepCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bodyId = useId();

  return (
    <section className={styles.card} data-open={isOpen}>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <span className={styles.step} aria-hidden="true">
            {step}
          </span>
          <span className={styles.title}>{title}</span>
          <span className={styles.chevron} aria-hidden="true">
            <ChevronDownIcon width={20} height={20} />
          </span>
        </button>
      </h3>
      <div id={bodyId} className={styles.body}>
        <div className={styles.clip}>
          <div className={styles.content}>
            <p className={styles.description}>{description}</p>
            {children}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}