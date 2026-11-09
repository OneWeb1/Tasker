import type { ButtonHTMLAttributes } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'md' | 'lg';
  variant?: 'outlined' | 'ghost';
}

export function IconButton({
  label,
  size = 'md',
  variant = 'outlined',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={styles.button}
      data-size={size}
      data-variant={variant}
      aria-label={label}
      {...rest}
    />
  );
}