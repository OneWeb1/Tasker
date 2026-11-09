import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRightIcon, CheckIcon } from '@/shared/ui/icons';
import { COMMENT_MAX_LENGTH } from '../../model/constants/comment';
import styles from './CommentComposer.module.css';

interface CommentComposerProps {
  onSubmit: (text: string) => void;
  editingText?: string | null;
  onCancelEdit?: () => void;
}

export function CommentComposer({
  onSubmit,
  editingText = null,
  onCancelEdit,
}: CommentComposerProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldFocusEndRef = useRef(false);
  const isEditing = editingText !== null;
  const isValid = text.trim() !== '';

  useEffect(() => {
    if (editingText === null) return;
    shouldFocusEndRef.current = true;
    setText(editingText);
  }, [editingText]);

  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;

    if (shouldFocusEndRef.current) {
      shouldFocusEndRef.current = false;
      element.focus();
      element.setSelectionRange(element.value.length, element.value.length);
    }
  }, [text]);

  const handleCancel = () => {
    setText('');
    onCancelEdit?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    onSubmit(text);
    setText('');
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      {isEditing && (
        <div className={styles.banner}>
          <span>Ви редагуєте існуючий коментар.</span>
          <button type="button" className={styles.cancel} onClick={handleCancel}>
            Скасувати
          </button>
        </div>
      )}
      <textarea
        ref={inputRef}
        className={styles.input}
        rows={1}
        value={text}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="Напишіть коментар"
        aria-label="Коментар"
        onChange={(event) => setText(event.target.value)}
      />
      <button
        type="submit"
        className={styles.send}
        aria-label={isEditing ? 'Зберегти зміни' : 'Надіслати коментар'}
        disabled={!isValid}
        onPointerDown={(event) => event.preventDefault()}
      >
        {isEditing ? (
          <CheckIcon width={22} height={22} />
        ) : (
          <ArrowRightIcon width={22} height={22} />
        )}
      </button>
    </form>
  );
}