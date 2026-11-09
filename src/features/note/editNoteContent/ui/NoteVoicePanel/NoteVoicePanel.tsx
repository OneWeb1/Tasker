import { useEffect, useRef } from 'react';
import { CheckIcon, CloseIcon, TextFormatIcon, TrashIcon } from '@/shared/ui/icons';
import type { VoiceStatus } from '../../model/hooks/useNoteVoiceInput';
import styles from './NoteVoicePanel.module.css';

interface NoteVoicePanelProps {
  status: VoiceStatus;
  transcript: string;
  onCancel: () => void;
  onConfirm: () => void;
  onInsert: () => void;
}

const BARS = Array.from({ length: 28 }, (_, index) => index);

const HINTS: Partial<Record<VoiceStatus, string>> = {
  listening: 'Говоріть…',
  review: 'Нічого не розпізнано',
  error: 'Не вдалося розпізнати мову',
};

export function NoteVoicePanel({
  status,
  transcript,
  onCancel,
  onConfirm,
  onInsert,
}: NoteVoicePanelProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const isListening = status === 'listening';
  const canInsert = status === 'review' && transcript !== '';
  const hint = HINTS[status];

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) stage.scrollTop = stage.scrollHeight;
  }, [transcript]);

  return (
    <div className={styles.panel}>
      {isListening && (
        <div className={styles.wave} aria-hidden="true">
          {BARS.map((index) => (
            <span key={index} className={styles.bar} style={{ '--index': index } as never} />
          ))}
        </div>
      )}
      <div ref={stageRef} className={styles.stage} aria-live="polite">
        {transcript ? (
          <p className={styles.text}>{transcript}</p>
        ) : (
          hint && <p className={styles.hint}>{hint}</p>
        )}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          aria-label={isListening ? 'Скасувати' : 'Видалити'}
          onClick={onCancel}
        >
          {isListening ? <CloseIcon width={26} height={26} /> : <TrashIcon width={26} height={26} />}
        </button>
        {isListening && (
          <button type="button" className={styles.primary} aria-label="Готово" onClick={onConfirm}>
            <CheckIcon width={28} height={28} />
          </button>
        )}
        {canInsert && (
          <button type="button" className={styles.insert} onClick={onInsert}>
            <TextFormatIcon width={22} height={22} />
            Вставити текст
          </button>
        )}
      </div>
    </div>
  );
}