import { useCallback, useState } from 'react';

export function useNoteSectionActions() {
  const [ordinal, setOrdinal] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const openMenu = useCallback((next: number) => {
    setOrdinal(next);
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const openAi = useCallback(() => {
    setIsMenuOpen(false);
    setIsAiOpen(true);
  }, []);

  const closeAi = useCallback(() => setIsAiOpen(false), []);

  return { ordinal, isMenuOpen, isAiOpen, openMenu, closeMenu, openAi, closeAi };
}