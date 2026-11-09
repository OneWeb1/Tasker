import { useCallback, useState } from 'react';
import type { ParseResult } from '@/shared/lib/utils/json';

const SAVE_ERROR_MESSAGE = 'Не вдалося зберегти. Спробуйте ще раз.';

export function useJsonImport(importJson: (raw: string) => Promise<ParseResult<unknown>>) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((value: string) => {
    setRaw(value);
    setError(null);
  }, []);

  const handleImport = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await importJson(raw);
      setError(result.ok ? null : result.error);
    } catch {
      setError(SAVE_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { raw, error, isSubmitting, handleChange, handleImport };
}