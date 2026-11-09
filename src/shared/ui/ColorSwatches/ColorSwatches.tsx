import type { CSSProperties } from 'react';
import { CheckIcon } from '@/shared/ui/icons';
import styles from './ColorSwatches.module.css';

interface ColorSwatchesItem {
  value: string;
  label: string;
  color: string;
  isEmpty?: boolean;
}

interface ColorSwatchesCustom {
  label: string;
  color: string;
  isSelected: boolean;
  onChange: (color: string) => void;
}

interface ColorSwatchesProps {
  label: string;
  items: readonly ColorSwatchesItem[];
  value: string;
  custom: ColorSwatchesCustom;
  onChange: (value: string) => void;
}

export function ColorSwatches({ label, items, value, custom, onChange }: ColorSwatchesProps) {
  return (
    <div className={styles.swatches} role="radiogroup" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="radio"
          aria-checked={item.value === value}
          aria-label={item.label}
          className={styles.swatch}
          data-empty={item.isEmpty}
          style={{ '--swatch-color': item.color } as CSSProperties}
          onClick={() => onChange(item.value)}
        >
          {item.value === value && <CheckIcon width={12} height={12} />}
        </button>
      ))}
      <label
        className={`${styles.swatch} ${styles.custom}`}
        data-selected={custom.isSelected}
        style={{ '--swatch-color': custom.color } as CSSProperties}
      >
        {custom.isSelected && <CheckIcon width={12} height={12} />}
        <input
          type="color"
          className={styles.input}
          aria-label={custom.label}
          value={custom.color}
          onChange={(event) => custom.onChange(event.target.value)}
        />
      </label>
    </div>
  );
}