import type { FocusEvent, KeyboardEvent } from 'react';
import styles from './NoteAttachmentCaption.module.css';

const CAPTION_MAX_LENGTH = 120;

interface NoteAttachmentCaptionProps {
  value: string;
  label: string;
  onChange?: (value: string) => void;
}

export function NoteAttachmentCaption({ value, label, onChange }: NoteAttachmentCaptionProps) {
  if (!onChange) {
    return value === '' ? null : <p className={styles.text}>{value}</p>;
  }

  const commit = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.currentTarget.value.trim();
    if (next !== value) onChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <input
      key={value}
      className={styles.input}
      type="text"
      defaultValue={value}
      maxLength={CAPTION_MAX_LENGTH}
      placeholder="Підпис"
      aria-label={label}
      enterKeyHint="done"
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
}