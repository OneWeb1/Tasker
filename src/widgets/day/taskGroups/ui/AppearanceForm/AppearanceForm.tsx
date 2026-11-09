import { useState } from 'react';
import type { FormEvent } from 'react';
import { CategoryAppearancePicker } from '@/entities/category';
import type { CategoryColor } from '@/entities/category';
import type { CategoryAppearance } from '@/features/category/editCategoryAppearance';
import { Button } from '@/shared/ui/Button';
import styles from './AppearanceForm.module.css';

interface AppearanceFormProps {
  initialEmoji: string;
  initialColor: CategoryColor;
  onSubmit: (appearance: CategoryAppearance) => void;
}

export function AppearanceForm({ initialEmoji, initialColor, onSubmit }: AppearanceFormProps) {
  const [emoji, setEmoji] = useState(initialEmoji);
  const [color, setColor] = useState(initialColor);
  const isChanged = emoji !== initialEmoji || color !== initialColor;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isChanged) onSubmit({ emoji, color });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <CategoryAppearancePicker
        emoji={emoji}
        color={color}
        onEmojiChange={setEmoji}
        onColorChange={setColor}
      />
      <Button type="submit" fullWidth disabled={!isChanged}>
        Зберегти
      </Button>
    </form>
  );
}