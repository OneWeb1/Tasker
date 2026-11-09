import type { TaskAttachment } from '@/entities/task';
import { decodeFileName } from '@/shared/lib/utils/fileName';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { FilePreview } from '@/shared/ui/FilePreview';
import { formatFileSize } from '../../model/lib/formatFileSize';
import styles from './AttachmentPreviewSheet.module.css';

interface AttachmentPreviewSheetProps {
  attachment: TaskAttachment;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function AttachmentPreviewSheet({
  attachment,
  isOpen,
  onClose,
  onDownload,
}: AttachmentPreviewSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      title={decodeFileName(attachment.name)}
      size="full"
      onClose={onClose}
    >
      <div className={styles.preview}>
        <div className={styles.stage}>
          <FilePreview
            name={decodeFileName(attachment.name)}
            type={attachment.type}
            blobId={attachment.blobId}
          />
        </div>
        <p className={styles.size}>{formatFileSize(attachment.size)}</p>
        <Button fullWidth onClick={onDownload}>
          Завантажити
        </Button>
      </div>
    </BottomSheet>
  );
}