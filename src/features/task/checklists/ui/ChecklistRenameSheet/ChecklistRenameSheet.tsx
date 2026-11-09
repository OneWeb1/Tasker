import { useState } from 'react';
import type { FormEvent } from 'react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { CHECKLIST_TITLE_MAX_LENGTH } from '../../model/constants/checklist';
import styles from './ChecklistRenameSheet.module.css';

interface ChecklistRenameSheetProps {
  isOpen: boolean;
  initialTitle: string;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

interface RenameFormProps {
  initialTitle: string;
  onSubmit: (title: string) => void;
}

function RenameForm({ initialTitle, onSubmit }: RenameFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const trimmed = title.trim();
  const isValid = trimmed !== '' && trimmed !== initialTitle;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid) onSubmit(trimmed);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={title}
        aria-label="Назва чекліста"
        maxLength={CHECKLIST_TITLE_MAX_LENGTH}
        autoFocus
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Button type="submit" fullWidth disabled={!isValid}>
        Зберегти
      </Button>
    </form>
  );
}

export function ChecklistRenameSheet({
  isOpen,
  initialTitle,
  onClose,
  onSubmit,
}: ChecklistRenameSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Перейменувати чекліст" onClose={onClose}>
      <RenameForm initialTitle={initialTitle} onSubmit={onSubmit} />
    </BottomSheet>
  );
}