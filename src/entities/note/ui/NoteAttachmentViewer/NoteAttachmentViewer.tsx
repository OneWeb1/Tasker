import { useState } from 'react';
import { useBlobUrl } from '@/shared/lib/hooks/useBlobUrl';
import { decodeFileName } from '@/shared/lib/utils/fileName';
import { FilePreview } from '@/shared/ui/FilePreview';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import type { NoteAttachment } from '../../model/types/note';
import styles from './NoteAttachmentViewer.module.css';
import { ZoomableImage } from './ZoomableImage';

interface NoteAttachmentViewerProps {
  attachment: NoteAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ViewerContentProps {
  attachment: NoteAttachment;
  onZoomChange: (isZoomed: boolean) => void;
}

function ViewerContent({ attachment, onZoomChange }: ViewerContentProps) {
  const name = decodeFileName(attachment.name);
  const url = useBlobUrl(attachment.blobId);

  if (attachment.type.startsWith('image/')) {
    return url ? (
      <ZoomableImage key={attachment.id} src={url} alt={name} onZoomChange={onZoomChange} />
    ) : null;
  }
  return (
    <div className={styles.file}>
      <FilePreview name={name} type={attachment.type} blobId={attachment.blobId} />
      {url && (
        <a className={styles.download} href={url} download={name}>
          Завантажити
        </a>
      )}
    </div>
  );
}

export function NoteAttachmentViewer({ attachment, isOpen, onClose }: NoteAttachmentViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <SlideScreen
      isOpen={isOpen}
      title={attachment ? decodeFileName(attachment.name) : 'Вкладення'}
      isHeaderPlain
      swipeToDismiss={!isZoomed}
      onClose={onClose}
    >
      {attachment && (
        <div className={styles.viewer} data-zoomed={isZoomed || undefined}>
          <ViewerContent key={attachment.id} attachment={attachment} onZoomChange={setIsZoomed} />
        </div>
      )}
    </SlideScreen>
  );
}