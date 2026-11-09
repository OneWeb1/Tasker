import type { CategoryColor } from '../../model/types/category';
import { CategoryColorPicker } from '../CategoryColorPicker';
import { CategoryEmojiPicker } from '../CategoryEmojiPicker';
import styles from './CategoryAppearancePicker.module.css';

interface CategoryAppearancePickerProps {
  emoji: string;
  color: CategoryColor;
  onEmojiChange: (emoji: string) => void;
  onColorChange: (color: CategoryColor) => void;
}

export function CategoryAppearancePicker({
  emoji,
  color,
  onEmojiChange,
  onColorChange,
}: CategoryAppearancePickerProps) {
  return (
    <div className={styles.picker}>
      <CategoryEmojiPicker value={emoji} onChange={onEmojiChange} />
      <CategoryColorPicker value={color} onChange={onColorChange} />
    </div>
  );
}