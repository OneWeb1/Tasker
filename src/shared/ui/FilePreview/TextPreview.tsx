import { useEffect, useState } from 'react';
import styles from './FilePreview.module.css';

const MAX_TEXT_BYTES = 256 * 1024;

interface TextPreviewProps {
  blob: Blob;
  onFail: () => void;
}

interface TextContent {
  text: string;
  isTruncated: boolean;
}

export function TextPreview({ blob, onFail }: TextPreviewProps) {
  const [content, setContent] = useState<TextContent | null>(null);

  useEffect(() => {
    let isCancelled = false;

    blob
      .slice(0, MAX_TEXT_BYTES)
      .text()
      .then(
        (text) => {
          if (!isCancelled) setContent({ text, isTruncated: blob.size > MAX_TEXT_BYTES });
        },
        () => {
          if (!isCancelled) onFail();
        },
      );

    return () => {
      isCancelled = true;
    };
  }, [blob, onFail]);

  if (content === null) return null;

  return (
    <div className={styles.textView}>
      <pre className={styles.text}>{content.text}</pre>
      {content.isTruncated && (
        <p className={styles.note}>Показано лише початок файлу. Завантажте його, щоб побачити все.</p>
      )}
    </div>
  );
}