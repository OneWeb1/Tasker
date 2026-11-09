import { useCallback, useEffect, useState } from 'react';

const EXIT_FALLBACK_MS = 800;

export function useExitTransition(isOpen: boolean) {
  const [isMounted, setIsMounted] = useState(isOpen);

  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    if (isOpen || !isMounted) return;
    const timer = window.setTimeout(() => setIsMounted(false), EXIT_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, isMounted]);

  const handleExited = useCallback(() => {
    if (!isOpen) setIsMounted(false);
  }, [isOpen]);

  return { isMounted, isClosing: isMounted && !isOpen, handleExited };
}