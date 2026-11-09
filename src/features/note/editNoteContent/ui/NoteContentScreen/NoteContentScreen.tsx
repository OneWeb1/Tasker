import type { Dispatch, SetStateAction } from 'react';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import type { NoteAttachment } from '../../model/types/noteAttachment';
import type { NoteTextAlign } from '../../model/types/noteFormat';
import { NoteContentEditor } from '../NoteContentEditor';
import styles from './NoteContentScreen.module.css';

interface NoteContentScreenProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  attachments: NoteAttachment[];
  onAttachmentsChange: Dispatch<SetStateAction<NoteAttachment[]>>;
  textAlign: NoteTextAlign;
  onTextAlignChange: (align: NoteTextAlign) => void;
  onClose: () => void;
}

export function NoteContentScreen({
  isOpen,
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  textAlign,
  onTextAlignChange,
  onClose,
}: NoteContentScreenProps) {
  return (
    <SlideScreen
      isOpen={isOpen}
      title="Контент нотатки"
      isHeaderPlain
      action={
        <button type="button" className={styles.done} onClick={onClose}>
          Готово
        </button>
      }
      onClose={onClose}
    >
      <NoteContentEditor
        value={value}
        onChange={onChange}
        attachments={attachments}
        onAttachmentsChange={onAttachmentsChange}
        textAlign={textAlign}
        onTextAlignChange={onTextAlignChange}
      />
    </SlideScreen>
  );
}