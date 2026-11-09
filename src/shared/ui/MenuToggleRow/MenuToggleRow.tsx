import { Toggle } from '@/shared/ui/Toggle';
import styles from './MenuToggleRow.module.css';

interface MenuToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function MenuToggleRow({ label, checked, onChange }: MenuToggleRowProps) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <Toggle checked={checked} label={label} onChange={onChange} />
    </div>
  );
}