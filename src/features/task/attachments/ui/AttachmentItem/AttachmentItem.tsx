import type { TaskAttachment } from '@/entities/task';
import { useBlobUrl } from '@/shared/lib/hooks/useBlobUrl';
import { MoreIcon } from '@/shared/ui/icons';
import { formatFileSize } from '../../model/lib/formatFileSize';
import { getFileExtension } from '../../model/lib/getFileExtension';
import styles from './AttachmentItem.module.css';

function AttachmentThumb({ attachment }: { attachment: TaskAttachment }) {
  const url = useBlobUrl(attachment.blobId);
  return url ? <img className={styles.thumb} src={url} alt="" /> : null;
}

interface AttachmentItemProps {
  attachment: TaskAttachment;
  isSelecting: boolean;
  isSelected: boolean;
  isReadOnly?: boolean;
  onOpen: (attachment: TaskAttachment) => void;
  onOpenMenu: (attachment: TaskAttachment) => void;
}

export function AttachmentItem({
  attachment,
  isSelecting,
  isSelected,
  isReadOnly = false,
  onOpen,
  onOpenMenu,
}: AttachmentItemProps) {
  return (
    <li className={styles.item} data-selected={isSelecting ? isSelected : undefined}>
      <button
        type="button"
        className={styles.file}
        aria-haspopup={isSelecting ? undefined : 'dialog'}
        aria-pressed={isSelecting ? isSelected : undefined}
        aria-label={
          isSelecting ? `Вибрати: ${attachment.name}` : `Переглянути: ${attachment.name}`
        }
        onClick={() => onOpen(attachment)}
      >
        {attachment.type.startsWith('image/') ? (
          <AttachmentThumb attachment={attachment} />
        ) : (
          <span className={styles.badge} aria-hidden="true">
            {getFileExtension(attachment.name)}
          </span>
        )}
        <span className={styles.info}>
          <span className={styles.name}>{attachment.name}</span>
          <span className={styles.size}>{formatFileSize(attachment.size)}</span>
        </span>
      </button>
      {!isSelecting && !isReadOnly && (
        <button
          type="button"
          className={styles.more}
          aria-haspopup="dialog"
          aria-label={`Дії з вкладенням: ${attachment.name}`}
          onClick={() => onOpenMenu(attachment)}
        >
          <MoreIcon width={20} height={20} />
        </button>
      )}
    </li>
  );
}