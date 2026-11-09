import { useLayoutEffect, useState } from 'react';

export function useElementWidth<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!element) return;
    const update = () => setWidth(element.offsetWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref: setElement, width };
}