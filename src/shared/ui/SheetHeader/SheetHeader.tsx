import type { ReactNode } from 'react';
import { CloseIcon } from '@/shared/ui/icons';
import styles from './SheetHeader.module.css';

interface SheetHeaderProps {
  icon: ReactNode;
  color?: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function SheetHeader({ icon, color, title, subtitle, onClose }: SheetHeaderProps) {
  return (
    <div className={styles.header}>
      <span className={styles.tile} data-color={color} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <button type="button" className={styles.close} aria-label="Закрити" onClick={onClose}>
        <CloseIcon width={20} height={20} />
      </button>
    </div>
  );
}