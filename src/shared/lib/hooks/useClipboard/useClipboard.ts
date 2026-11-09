import { useCallback, useEffect, useRef, useState } from 'react';

export type ClipboardStatus = 'idle' | 'done' | 'failed';

const STATUS_RESET_DELAY_MS = 2000;

export function useClipboard(resetDelayMs: number = STATUS_RESET_DELAY_MS) {
  const [status, setStatus] = useState<ClipboardStatus>('idle');
  const timerRef = useRef<number | undefined>(undefined);

  const flash = useCallback((next: ClipboardStatus) => {
    window.clearTimeout(timerRef.current);
    setStatus(next);
    timerRef.current = window.setTimeout(() => setStatus('idle'), resetDelayMs);
  }, [resetDelayMs]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        flash('done');
      } catch {
        flash('failed');
      }
    },
    [flash],
  );

  const paste = useCallback(async (): Promise<string | null> => {
    try {
      const text = await navigator.clipboard.readText();
      flash('done');
      return text;
    } catch {
      flash('failed');
      return null;
    }
  }, [flash]);

  return { status, copy, paste };
}