import { useState } from 'react';
import type { FormEvent } from 'react';
import { TITLE_FOCUS_DELAY_MS } from '@/features/createItem';
import { focusTextOnTap } from '@/shared/lib/utils/focusTextOnTap';
import { Button } from '@/shared/ui/Button';
import { EditableText } from '@/shared/ui/EditableText';
import styles from './RenameForm.module.css';

interface RenameFormProps {
  initialTitle: string;
  label: string;
  maxLength?: number;
  onSubmit: (title: string) => void;
}

export function RenameForm({ initialTitle, label, maxLength, onSubmit }: RenameFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const trimmed = title.trim();
  const isValid = trimmed !== '' && trimmed !== initialTitle;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid) onSubmit(trimmed);
  };

  return (
    <div className={styles.screen} onClick={focusTextOnTap}>
      <div className={styles.head}>
        <EditableText
          variant="title"
          label={label}
          placeholder={label}
          value={title}
          maxLength={maxLength}
          autoFocusDelay={TITLE_FOCUS_DELAY_MS}
          onChange={setTitle}
          onSave={setTitle}
        />
      </div>
      <form className={styles.footer} onSubmit={handleSubmit}>
        <Button type="submit" fullWidth disabled={!isValid}>
          Зберегти
        </Button>
      </form>
    </div>
  );
}