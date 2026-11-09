import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAttachmentSlots } from '@/shared/lib/hooks/useAttachmentSlots';
import { useTextSelection } from '@/shared/lib/hooks/useTextSelection';
import type { TextSelectionOptions } from '@/shared/lib/hooks/useTextSelection';
import { readAttachmentSlot } from '@/shared/lib/utils/markdown';
import { RichText } from '@/shared/ui/RichText';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import type { Note, NoteFragment } from '../../model/types/note';
import { NoteAttachmentList } from '../NoteAttachmentList';
import { NoteSelectionHandles } from '../NoteSelectionHandles';
import { NoteSelectionMenu } from '../NoteSelectionMenu';
import styles from './NoteScreen.module.css';

interface NoteScreenProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSectionAction?: (ordinal: number) => void;
  onSelectionEdit?: (fragment: NoteFragment) => void;
  onSelectionAi?: (text: string) => void;
}

const UNTITLED = 'Без назви';

const SELECTION_OPTIONS: TextSelectionOptions = {
  highlightName: 'note-selection',
  ignoreSelector: 'a, button, [data-b="attachments"]',
};

const formatUpdatedAt = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export function NoteScreen({
  note,
  isOpen,
  onClose,
  onSectionAction,
  onSelectionEdit,
  onSelectionAi,
}: NoteScreenProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const hasSelectionActions = onSelectionEdit !== undefined || onSelectionAi !== undefined;
  const { selection, isDragging, clear, beginHandleDrag, moveHandle, endHandleDrag } =
    useTextSelection(
      contentRef,
      isOpen && hasSelectionActions && note !== null,
      SELECTION_OPTIONS,
    );
  const slots = useAttachmentSlots(contentRef, note?.content);
  const attachments = note?.attachments ?? [];
  const unplaced = attachments.filter(
    ({ groupId }) => groupId === undefined || !slots.has(groupId),
  );

  return (
    <SlideScreen isOpen={isOpen} title="Нотатка" isHeaderPlain onClose={onClose}>
      {note && (
        <article className={styles.note}>
          <h1 className={styles.title}>{note.title.trim() || UNTITLED}</h1>
          <time className={styles.date} dateTime={new Date(note.updatedAt).toISOString()}>
            {formatUpdatedAt(note.updatedAt)}
          </time>
          <div ref={contentRef}>
            <RichText
              className={styles.content}
              source={note.content}
              textAlign={note.textAlign}
              onToggleAction={onSectionAction}
            />
          </div>
          {Array.from(slots, ([id, slot]) => {
            const items = attachments.filter((item) => item.groupId === id);
            const placeholder = readAttachmentSlot(slot);
            if (items.length === 0 && !placeholder) return null;
            return createPortal(
              <NoteAttachmentList attachments={items} placeholder={placeholder} />,
              slot,
              id,
            );
          })}
          <NoteAttachmentList attachments={unplaced} />
          {selection && (
            <NoteSelectionHandles
              selection={selection}
              onDragStart={beginHandleDrag}
              onDrag={moveHandle}
              onDragEnd={endHandleDrag}
            />
          )}
          {selection && !isDragging && (
            <NoteSelectionMenu
              anchor={selection}
              onEdit={
                onSelectionEdit
                  ? () => {
                      const { text, occurrence } = selection;
                      clear();
                      onSelectionEdit({ text, occurrence });
                    }
                  : undefined
              }
              onImproveWithAi={
                onSelectionAi
                  ? () => {
                      const { text } = selection;
                      clear();
                      onSelectionAi(text);
                    }
                  : undefined
              }
            />
          )}
        </article>
      )}
    </SlideScreen>
  );
}