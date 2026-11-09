import { useEffect, useRef, useState } from 'react';
import styles from './ChecklistTitleInput.module.css';

interface ChecklistTitleInputProps {
  label: string;
  initialValue?: string;
  placeholder?: string;
  keepOpenOnEnter?: boolean;
  onCommit: (title: string) => void;
  onEnd: () => void;
}

export function ChecklistTitleInput({
  label,
  initialValue = '',
  placeholder,
  keepOpenOnEnter = false,
  onCommit,
  onEnd,
}: ChecklistTitleInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isSettledRef = useRef(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }, []);

  const settle = (shouldCommit: boolean) => {
    if (isSettledRef.current) return;
    isSettledRef.current = true;

    const next = value.trim();
    if (shouldCommit && next) onCommit(next);
    onEnd();
  };

  return (
    <input
      ref={inputRef}
      className={styles.input}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      enterKeyHint="done"
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => settle(true)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const next = value.trim();
          if (!next) {
            settle(false);
          } else if (keepOpenOnEnter) {
            onCommit(next);
            setValue('');
          } else {
            settle(true);
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          settle(false);
        }
      }}
    />
  );
}