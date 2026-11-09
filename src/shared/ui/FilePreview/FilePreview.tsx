import { useCallback, useState } from 'react';
import { useBlob } from '@/shared/lib/hooks/useBlob';
import { useObjectUrl } from '@/shared/lib/hooks/useObjectUrl';
import { getFilePreviewMode } from '@/shared/lib/utils/fileType';
import { FileTypeIcon } from '@/shared/ui/FileTypeIcon';
import styles from './FilePreview.module.css';
import { PdfPreview } from './PdfPreview';
import { TextPreview } from './TextPreview';

interface FilePreviewProps {
  name: string;
  type?: string;
  blobId: string;
}

export function FilePreview({ name, type, blobId }: FilePreviewProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const { blob, isLoading } = useBlob(blobId);
  const handleError = useCallback(() => setFailedSource(blobId), [blobId]);
  const isFailed = failedSource === blobId || (!isLoading && blob === null);
  const mode = isFailed ? 'none' : getFilePreviewMode(name, type);
  const isMedia = mode === 'image' || mode === 'video' || mode === 'audio';
  const mediaUrl = useObjectUrl(isMedia ? blob : null);

  const renderContent = () => {
    if (isLoading) return null;

    switch (mode) {
      case 'image':
        return mediaUrl && <img className={styles.media} src={mediaUrl} alt={name} onError={handleError} />;
      case 'video':
        return (
          mediaUrl && (
            <video
              className={styles.media}
              src={mediaUrl}
              controls
              playsInline
              onError={handleError}
            />
          )
        );
      case 'audio':
        return mediaUrl && <audio className={styles.audio} src={mediaUrl} controls onError={handleError} />;
      case 'pdf':
        return blob && <PdfPreview name={name} blob={blob} />;
      case 'text':
        return blob && <TextPreview blob={blob} onFail={handleError} />;
      case 'none':
        return (
          <div className={styles.fallback}>
            <FileTypeIcon name={name} type={type} size={64} />
            <p className={styles.message}>
              Попередній перегляд для цього типу файлу недоступний. Завантажте файл, щоб відкрити
              його.
            </p>
          </div>
        );
    }

  };

  return <div className={styles.root}>{renderContent()}</div>;
}