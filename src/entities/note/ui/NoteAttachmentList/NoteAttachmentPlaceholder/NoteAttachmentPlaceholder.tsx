import { AttachmentIcon, CloseIcon, ImageIcon } from '@/shared/ui/icons';
import styles from './NoteAttachmentPlaceholder.module.css';

export interface NoteAttachmentPlaceholderProps {
  kind: 'media' | 'file';
  title: string;
  onPick?: () => void;
  onRemove?: () => void;
}

const HINTS: Record<NoteAttachmentPlaceholderProps['kind'], string> = {
  media: 'Додати фото або відео',
  file: 'Додати файл',
};

export function NoteAttachmentPlaceholder({
  kind,
  title,
  onPick,
  onRemove,
}: NoteAttachmentPlaceholderProps) {
  const Icon = kind === 'media' ? ImageIcon : AttachmentIcon;
  const hint = HINTS[kind];
  const content = (
    <>
      <Icon width={28} height={28} />
      <span className={styles.title}>{title || hint}</span>
      {onPick && title !== '' && <span className={styles.hint}>{hint}</span>}
    </>
  );

  return (
    <div className={styles.root}>
      {onPick ? (
        <button type="button" className={styles.tile} aria-label={hint} onClick={onPick}>
          {content}
        </button>
      ) : (
        <div className={styles.tile}>{content}</div>
      )}
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          aria-label="Прибрати місце для вкладення"
          onClick={onRemove}
        >
          <CloseIcon width={12} height={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}