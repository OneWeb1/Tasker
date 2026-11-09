import { CATEGORY_COLOR_PRESETS } from '../../model/constants/categories';
import type { CategoryColor } from '../../model/types/category';
import { isHexColor } from '../../lib/categoryColorStyle';
import styles from './CategoryColorPicker.module.css';

const FALLBACK_CUSTOM_COLOR = '#6d4aff';

interface CategoryColorPickerProps {
  value: CategoryColor;
  onChange: (color: CategoryColor) => void;
}

export function CategoryColorPicker({ value, onChange }: CategoryColorPickerProps) {
  const normalized = value.toLowerCase();
  const isPreset = CATEGORY_COLOR_PRESETS.includes(normalized);

  return (
    <div className={styles.colors} role="radiogroup" aria-label="Колір">
      {CATEGORY_COLOR_PRESETS.map((item) => (
        <button
          key={item}
          type="button"
          role="radio"
          aria-checked={item === normalized}
          aria-label={item.toUpperCase()}
          className={styles.color}
          style={{ background: item }}
          onClick={() => onChange(item)}
        />
      ))}
      <label
        className={`${styles.color} ${styles.custom}`}
        data-selected={!isPreset}
        style={!isPreset && isHexColor(value) ? { background: value } : undefined}
      >
        <input
          type="color"
          className={styles.input}
          aria-label="Власний колір"
          value={isHexColor(value) ? normalized : FALLBACK_CUSTOM_COLOR}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}