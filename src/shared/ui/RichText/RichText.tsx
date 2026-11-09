import { useEffect, useMemo, useRef } from 'react';
import { renderMarkdownHtml, toggleBlockCollapsed } from '@/shared/lib/utils/markdown';
import styles from './RichText.module.css';

export const richTextClassName = styles.root;

interface RichTextProps {
  source: string;
  textAlign?: 'left' | 'center' | 'right';
  className?: string;
  onToggleAction?: (ordinal: number) => void;
}

const getToggleOrdinal = (root: HTMLElement, block: Element): number =>
  Array.from(root.children)
    .filter((child) => child instanceof HTMLElement && child.dataset.b === 'toggle')
    .indexOf(block);

export function RichText({ source, textAlign, className, onToggleAction }: RichTextProps) {
  const hasActions = onToggleAction !== undefined;
  const html = useMemo(
    () => renderMarkdownHtml(source, { groupTables: true, toggleActions: hasActions }),
    [source, hasActions],
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('a')) return;
      const action = event.target.closest<HTMLElement>('[data-toggle-action]');
      if (action) {
        const owner = action.parentElement;
        if (owner && owner.parentElement === root) onToggleAction?.(getToggleOrdinal(root, owner));
        return;
      }
      if (window.getSelection()?.isCollapsed === false) return;
      const block = event.target.closest<HTMLElement>('[data-b="toggle"]');
      if (block && block.parentElement === root) toggleBlockCollapsed(block);
    };

    root.addEventListener('click', handleClick);
    return () => root.removeEventListener('click', handleClick);
  }, [onToggleAction]);

  return (
    <div
      ref={rootRef}
      className={className ? `${styles.root} ${className}` : styles.root}
      style={{ textAlign }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}