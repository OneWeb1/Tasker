import type { SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '@/shared/ui/icons';
import styles from './Select.module.css';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ children, ...rest }: SelectProps) {
  return (
    <div className={styles.wrapper}>
      <select className={styles.select} {...rest}>
        {children}
      </select>
      <ChevronDownIcon className={styles.icon} width={20} height={20} />
    </div>
  );
}