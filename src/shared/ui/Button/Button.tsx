import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={styles.button}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth}
      {...rest}
    />
  );
}