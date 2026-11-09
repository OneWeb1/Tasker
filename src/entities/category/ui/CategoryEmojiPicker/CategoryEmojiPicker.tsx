import { CATEGORY_EMOJIS } from '../../model/constants/categories';
import styles from './CategoryEmojiPicker.module.css';

interface CategoryEmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function CategoryEmojiPicker({ value, onChange }: CategoryEmojiPickerProps) {
  return (
    <div className={styles.emojis} role="radiogroup" aria-label="Емодзі">
      {CATEGORY_EMOJIS.map((item) => (
        <button
          key={item}
          type="button"
          role="radio"
          aria-checked={item === value}
          className={styles.emoji}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}