import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ checked, label, disabled, onChange }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={styles.checkbox}
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}