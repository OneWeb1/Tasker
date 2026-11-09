import { useEffect, useState } from 'react';
import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { NoteAttachmentList } from '@/entities/note';
import { useAttachmentSlots } from '@/shared/lib/hooks/useAttachmentSlots';
import { useKeyboardInset } from '@/shared/lib/hooks/useKeyboardInset';
import { readAttachmentSlot } from '@/shared/lib/utils/markdown';
import { richTextClassName } from '@/shared/ui/RichText';
import { CONTENT_FOCUS_DELAY_MS, DEFAULT_NOTE_ALIGN } from '../../model/constants/noteEditor';
import { useNoteAttachments } from '../../model/hooks/useNoteAttachments';
import { useNoteContentEditor } from '../../model/hooks/useNoteContentEditor';
import { useNoteVoiceInput } from '../../model/hooks/useNoteVoiceInput';
import type { NoteAttachment } from '../../model/types/noteAttachment';
import type {
  NoteInsertAction,
  NoteMediaSource,
  NotePanel,
  NoteTextAlign,
} from '../../model/types/noteFormat';
import { NoteFormatToolbar } from '../NoteFormatToolbar';
import { NoteInsertPanel } from '../NoteInsertPanel';
import { NoteVoicePanel } from '../NoteVoicePanel';
import styles from './NoteContentEditor.module.css';

interface NoteContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  attachments: NoteAttachment[];
  onAttachmentsChange: Dispatch<SetStateAction<NoteAttachment[]>>;
  textAlign: NoteTextAlign;
  onTextAlignChange: (align: NoteTextAlign) => void;
}

const keepEditorFocus = (event: MouseEvent) => event.preventDefault();

export function NoteContentEditor({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  textAlign,
  onTextAlignChange,
}: NoteContentEditorProps) {
  const groupIds = Array.from(
    new Set(attachments.flatMap(({ groupId }) => (groupId === undefined ? [] : [groupId]))),
  );
  const {
    rootRef,
    isEmpty,
    format,
    align,
    adoptAlign,
    insertText,
    insertDivider,
    insertTable,
    insertToggle,
    link,
    insertAttachmentGroup,
    removeAttachmentSlot,
    undo,
    redo,
    focus,
    focusEnd,
    focusTail,
    blur,
    canUndo,
    canRedo,
  } = useNoteContentEditor(value, onChange, groupIds);
  const keyboardInset = useKeyboardInset();
  const media = useNoteAttachments(onAttachmentsChange, insertAttachmentGroup);
  const slots = useAttachmentSlots(rootRef);
  const voice = useNoteVoiceInput();
  const { reset: resetVoice, start: startVoice } = voice;
  const [panel, setPanel] = useState<NotePanel | null>(null);
  const [isFormatMode, setIsFormatMode] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(focusEnd, CONTENT_FOCUS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [focusEnd]);

  useEffect(() => {
    if (textAlign === DEFAULT_NOTE_ALIGN) return;
    adoptAlign(textAlign);
    onTextAlignChange(DEFAULT_NOTE_ALIGN);
  }, [textAlign, adoptAlign, onTextAlignChange]);

  const closePanel = (shouldRefocus: boolean) => {
    resetVoice();
    setPanel(null);
    if (shouldRefocus) focus();
  };

  const togglePanel = (next: NotePanel) => {
    if (panel === next) {
      closePanel(true);
      return;
    }
    resetVoice();
    setPanel(next);
    blur();
    if (next === 'voice') startVoice();
  };

  const dismiss = () => {
    if (panel) closePanel(true);
    else blur();
  };

  const addLink = () => {
    const url = window.prompt('Адреса посилання (порожньо — прибрати посилання)', 'https://');
    if (url === null) return;
    link(url.trim() === 'https://' ? '' : url);
  };

  const insert = (action: NoteInsertAction) => {
    if (action === 'divider') insertDivider();
    else if (action === 'table') insertTable();
    else if (action === 'toggle') insertToggle();
    else format(action);
    closePanel(false);
  };

  const pickMedia = (source: NoteMediaSource) => {
    closePanel(false);
    media.openPicker(source);
  };

  const insertVoice = () => {
    insertText(voice.transcript);
    closePanel(false);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.content}>
        <div
          ref={rootRef}
          className={`${richTextClassName} ${styles.field}`}
          style={{ textAlign }}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Контент нотатки"
          data-placeholder="Контент нотатки…"
          data-empty={isEmpty || undefined}
        />
        {Array.from(slots, ([id, slot]) => {
          const items = attachments.filter((item) => item.groupId === id);
          const slotInfo = readAttachmentSlot(slot);
          if (items.length === 0 && !slotInfo) return null;
          return createPortal(
            <NoteAttachmentList
              attachments={items}
              placeholder={
                slotInfo && {
                  ...slotInfo,
                  onPick: () => media.pickForSlot(id, slotInfo.title, slotInfo.kind),
                  onRemove: () => removeAttachmentSlot(id),
                }
              }
              onRemove={media.remove}
              onRenameGroup={media.renameGroup}
              onCaptionChange={media.setCaption}
              onMove={media.move}
            />,
            slot,
            id,
          );
        })}
        <div className={styles.attachments}>
          <NoteAttachmentList
            attachments={attachments.filter(({ groupId }) => groupId === undefined)}
            error={media.error}
            onRemove={media.remove}
            onRenameGroup={media.renameGroup}
            onCaptionChange={media.setCaption}
            onMove={media.move}
          />
        </div>
        <div
          className={styles.tail}
          aria-hidden="true"
          onMouseDown={keepEditorFocus}
          onClick={focusTail}
        />
      </div>
      <input ref={media.inputRef} type="file" multiple hidden onChange={media.handleChange} />
      <div
        className={styles.dock}
        data-keyboard={keyboardInset > 0 || undefined}
        style={{ marginBottom: keyboardInset }}
        onMouseDown={keepEditorFocus}
      >
        <NoteFormatToolbar
          panel={panel}
          isFormatMode={isFormatMode}
          isVoiceAvailable={voice.isSupported}
          canUndo={canUndo}
          canRedo={canRedo}
          onTogglePanel={togglePanel}
          onToggleFormatMode={() => setIsFormatMode((current) => !current)}
          onFormat={format}
          onLink={addLink}
          onAlign={align}
          onUndo={undo}
          onRedo={redo}
          onDismiss={dismiss}
        />
        {panel === 'insert' && <NoteInsertPanel onSelect={insert} onPickMedia={pickMedia} />}
        {panel === 'voice' && (
          <NoteVoicePanel
            status={voice.status}
            transcript={voice.transcript}
            onCancel={() => closePanel(true)}
            onConfirm={voice.stop}
            onInsert={insertVoice}
          />
        )}
      </div>
    </div>
  );
}