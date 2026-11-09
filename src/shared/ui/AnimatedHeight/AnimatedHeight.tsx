import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import styles from './AnimatedHeight.module.css';

interface AnimatedHeightProps {
  children: ReactNode;
}

const FOLLOWED_TRANSITION =
  /^(height|min-height|max-height|grid-template-rows|padding|margin|gap|row-gap|flex-basis|transform)/;

export function AnimatedHeight({ children }: AnimatedHeightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let frame = 0;
    let heightFrame = 0;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      const isFollowing = content
        .getAnimations({ subtree: true })
        .some(
          (item) =>
            item instanceof CSSTransition && FOLLOWED_TRANSITION.test(item.transitionProperty),
        );
      cancelAnimationFrame(heightFrame);
      heightFrame = requestAnimationFrame(() => {
        container.dataset.following = String(isFollowing);
        container.style.height = `${next}px`;

        if (container.dataset.ready !== 'true') {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            container.dataset.ready = 'true';
          });
        }
      });
    });
    observer.observe(content);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(heightFrame);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </div>
  );
}