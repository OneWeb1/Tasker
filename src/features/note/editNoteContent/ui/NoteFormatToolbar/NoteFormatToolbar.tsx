import type { ReactNode } from 'react';
import {
  AlignIcon,
  BoldIcon,
  ChevronsLeftIcon,
  CloseIcon,
  CodeIcon,
  HighlightIcon,
  IndentIcon,
  ItalicIcon,
  LinkIcon,
  OutdentIcon,
  PlusIcon,
  RedoIcon,
  StrikethroughIcon,
  TextFormatIcon,
  UnderlineIcon,
  UndoIcon,
  WaveformIcon,
} from '@/shared/ui/icons';
import { NOTE_ALIGN_ITEMS } from '../../model/constants/noteEditor';
import type { NoteFormatAction, NotePanel, NoteTextAlign } from '../../model/types/noteFormat';
import styles from './NoteFormatToolbar.module.css';

interface NoteFormatToolbarProps {
  panel: NotePanel | null;
  isFormatMode: boolean;
  isVoiceAvailable: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onTogglePanel: (panel: NotePanel) => void;
  onToggleFormatMode: () => void;
  onFormat: (action: NoteFormatAction) => void;
  onLink: () => void;
  onAlign: (align: NoteTextAlign) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDismiss: () => void;
}

interface ToolbarButtonProps {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({ label, isActive, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      aria-pressed={isActive}
      data-active={isActive || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function NoteFormatToolbar({
  panel,
  isFormatMode,
  isVoiceAvailable,
  canUndo,
  canRedo,
  onTogglePanel,
  onToggleFormatMode,
  onFormat,
  onLink,
  onAlign,
  onUndo,
  onRedo,
  onDismiss,
}: NoteFormatToolbarProps) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Форматування тексту">
      <div className={styles.scroller}>
        {isFormatMode ? (
          <>
            <ToolbarButton label="Назад до інструментів" onClick={onToggleFormatMode}>
              <ChevronsLeftIcon />
            </ToolbarButton>
            <ToolbarButton label="Жирний" onClick={() => onFormat('bold')}>
              <BoldIcon />
            </ToolbarButton>
            <ToolbarButton label="Курсив" onClick={() => onFormat('italic')}>
              <ItalicIcon />
            </ToolbarButton>
            <ToolbarButton label="Підкреслений" onClick={() => onFormat('underline')}>
              <UnderlineIcon />
            </ToolbarButton>
            <ToolbarButton label="Закреслений" onClick={() => onFormat('strike')}>
              <StrikethroughIcon />
            </ToolbarButton>
            <ToolbarButton label="Посилання" onClick={onLink}>
              <LinkIcon />
            </ToolbarButton>
            <ToolbarButton label="Виділення" onClick={() => onFormat('highlight')}>
              <HighlightIcon />
            </ToolbarButton>
            <ToolbarButton label="Код" onClick={() => onFormat('code')}>
              <CodeIcon />
            </ToolbarButton>
          </>
        ) : (
          <>
            <ToolbarButton
              label="Додати блок"
              isActive={panel === 'insert'}
              onClick={() => onTogglePanel('insert')}
            >
              <PlusIcon />
            </ToolbarButton>
            {isVoiceAvailable && (
              <ToolbarButton
                label="Голосовий ввід"
                isActive={panel === 'voice'}
                onClick={() => onTogglePanel('voice')}
              >
                <WaveformIcon />
              </ToolbarButton>
            )}
            <ToolbarButton label="Форматування тексту" onClick={onToggleFormatMode}>
              <TextFormatIcon />
            </ToolbarButton>
            <ToolbarButton label="Зменшити відступ" onClick={() => onFormat('outdent')}>
              <OutdentIcon />
            </ToolbarButton>
            <ToolbarButton label="Збільшити відступ" onClick={() => onFormat('indent')}>
              <IndentIcon />
            </ToolbarButton>
            <ToolbarButton label="Скасувати" disabled={!canUndo} onClick={onUndo}>
              <UndoIcon />
            </ToolbarButton>
            <ToolbarButton label="Повторити" disabled={!canRedo} onClick={onRedo}>
              <RedoIcon />
            </ToolbarButton>
            {NOTE_ALIGN_ITEMS.map((item) => (
              <ToolbarButton
                key={item.value}
                label={item.label}
                onClick={() => onAlign(item.value)}
              >
                <AlignIcon align={item.value} />
              </ToolbarButton>
            ))}
          </>
        )}
      </div>
      {!isFormatMode && (
        <>
          <span className={styles.divider} aria-hidden="true" />
          <button type="button" className={styles.dismiss} aria-label="Закрити" onClick={onDismiss}>
            <span className={styles.dismissMark}>
              <CloseIcon width={14} height={14} strokeWidth={3} />
            </span>
          </button>
        </>
      )}
    </div>
  );
}