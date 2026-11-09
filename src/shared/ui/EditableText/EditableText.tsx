import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './EditableText.module.css';

interface EditableTextProps {
  value: string;
  label: string;
  variant: 'title' | 'description';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  autoFocusDelay?: number;
  onChange?: (value: string) => void;
  onSave: (value: string) => void;
}

export function EditableText({
  value,
  label,
  variant,
  placeholder,
  required = false,
  maxLength,
  autoFocusDelay,
  onChange,
  onSave,
}: EditableTextProps) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (autoFocusDelay === undefined) return;
    const timer = window.setTimeout(() => {
      const element = ref.current;
      if (!element) return;
      element.focus({ preventScroll: true });
      element.setSelectionRange(element.value.length, element.value.length);
    }, autoFocusDelay);
    return () => window.clearTimeout(timer);
  }, [autoFocusDelay]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [draft]);

  const commit = () => {
    const next = draft.trim();
    if (required && next === '') {
      setDraft(value);
      return;
    }
    setDraft(next);
    if (next !== value) onSave(next);
  };

  return (
    <textarea
      ref={ref}
      className={styles.text}
      data-variant={variant}
      rows={1}
      value={draft}
      aria-label={label}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(event) => {
        setDraft(event.target.value);
        onChange?.(event.target.value);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (variant === 'title' && event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}