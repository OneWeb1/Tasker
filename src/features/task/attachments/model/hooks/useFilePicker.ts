import { useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';

export function useFilePicker(onFiles: (files: File[]) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => inputRef.current?.click(), []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const files = Array.from(input.files ?? []);
      input.value = '';
      if (files.length > 0) onFiles(files);
    },
    [onFiles],
  );

  return { inputRef, open, handleChange };
}