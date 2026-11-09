import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TextSelection } from '@/shared/lib/hooks/useTextSelection';
import { EditIcon, SparklesIcon } from '@/shared/ui/icons';
import styles from './NoteSelectionMenu.module.css';

const MENU_HEIGHT = 43;
const EDGE_GAP = 5;
const GAP_BELOW = 24;
const GAP_ABOVE = 16;

interface NoteSelectionMenuProps {
  anchor: TextSelection;
  onEdit?: () => void;
  onImproveWithAi?: () => void;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function NoteSelectionMenu({ anchor, onEdit, onImproveWithAi }: NoteSelectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    setWidth(menuRef.current?.offsetWidth ?? 0);
  }, [onEdit, onImproveWithAi]);

  const half = width / 2;
  const left = clamp(anchor.x, half + EDGE_GAP, Math.max(window.innerWidth - half - EDGE_GAP, half + EDGE_GAP));
  const fitsAbove = anchor.top - GAP_ABOVE - MENU_HEIGHT >= EDGE_GAP;
  const top = fitsAbove
    ? anchor.top - GAP_ABOVE - MENU_HEIGHT
    : Math.min(anchor.bottom + GAP_BELOW, window.innerHeight - MENU_HEIGHT - EDGE_GAP);

  const keepSelection = (event: { preventDefault: () => void }) => event.preventDefault();

  return createPortal(
    <div
      ref={menuRef}
      role="toolbar"
      aria-label="Дії з виділеним текстом"
      data-selection-ui
      className={styles.menu}
      style={{ top, left, maxWidth: window.innerWidth - EDGE_GAP * 2 }}
      onPointerDown={keepSelection}
      onMouseDown={keepSelection}
    >
      {onEdit && (
        <button type="button" className={styles.action} onClick={onEdit}>
          <EditIcon width={18} height={18} />
          Редагувати
        </button>
      )}
      {onImproveWithAi && (
        <button type="button" className={styles.action} onClick={onImproveWithAi}>
          <SparklesIcon width={18} height={18} />
          Покращити через ШІ
        </button>
      )}
    </div>,
    document.body,
  );
}