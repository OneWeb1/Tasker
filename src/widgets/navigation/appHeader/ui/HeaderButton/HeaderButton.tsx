import type { ButtonHTMLAttributes } from 'react';
import styles from './HeaderButton.module.css';

interface HeaderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  fit?: 'fixed' | 'content';
  size?: 'md' | 'sm';
  tone?: 'default' | 'danger';
}

export function HeaderButton({
  label,
  fit = 'fixed',
  size = 'md',
  tone = 'default',
  type = 'button',
  ...rest
}: HeaderButtonProps) {
  return (
    <button
      type={type}
      className={styles.button}
      data-fit={fit}
      data-size={size}
      data-tone={tone}
      aria-label={label}
      {...rest}
    />
  );
}