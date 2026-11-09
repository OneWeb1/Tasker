import { useEffect, useState } from 'react';

const MIN_KEYBOARD_HEIGHT = 120;
const SCALE_TOLERANCE = 0.01;

export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const isZoomed = Math.abs(viewport.scale - 1) > SCALE_TOLERANCE;
      const covered = Math.round(window.innerHeight - (viewport.offsetTop + viewport.height));
      setInset(!isZoomed && covered >= MIN_KEYBOARD_HEIGHT ? covered : 0);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };

  }, []);

  return inset;
}