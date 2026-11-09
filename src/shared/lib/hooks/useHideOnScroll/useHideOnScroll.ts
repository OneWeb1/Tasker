import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

const SCROLL_THRESHOLD_PX = 8;

export function useHideOnScroll(ref: RefObject<HTMLElement | null>): boolean {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let scroller: Element | null = null;
    let lastTop = 0;

    const onScroll = (event: Event) => {
      const element = ref.current;
      const target =
        event.target instanceof Document ? document.scrollingElement : event.target;
      if (!element || !(target instanceof Element) || !target.contains(element)) return;

      if (target !== scroller) {
        scroller = target;
        lastTop = target.scrollTop;
        return;
      }

      const top = target.scrollTop;
      if (top <= 0) {
        lastTop = top;
        setIsHidden(false);
        return;
      }

      const delta = top - lastTop;
      if (Math.abs(delta) < SCROLL_THRESHOLD_PX) return;
      lastTop = top;
      setIsHidden(delta > 0);
    };

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, true);

  }, [ref]);

  return isHidden;
}