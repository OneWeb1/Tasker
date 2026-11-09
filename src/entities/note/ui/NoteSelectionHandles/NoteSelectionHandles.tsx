import { createPortal } from 'react-dom';
import type { PointerEvent } from 'react';
import type { HandleId, TextSelection } from '@/shared/lib/hooks/useTextSelection';
import styles from './NoteSelectionHandles.module.css';

const HANDLE_IDS: readonly HandleId[] = ['a', 'b'];

interface NoteSelectionHandlesProps {
  selection: TextSelection;
  onDragStart: (which: HandleId) => void;
  onDrag: (x: number, y: number) => void;
  onDragEnd: () => void;
}

export function NoteSelectionHandles({
  selection,
  onDragStart,
  onDrag,
  onDragEnd,
}: NoteSelectionHandlesProps) {
  const handleDown = (which: HandleId) => (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStart(which);
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      onDrag(event.clientX, event.clientY);
    }
  };

  const handleUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onDragEnd();
  };

  return createPortal(
    <>
      {HANDLE_IDS.map((which) => (
        <div
          key={which}
          className={styles.handle}
          data-selection-ui
          style={{ left: selection.handles[which].x, top: selection.handles[which].y }}
          onPointerDown={handleDown(which)}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        >
          <span className={styles.drop} />
        </div>
      ))}
    </>,
    document.body,
  );
}