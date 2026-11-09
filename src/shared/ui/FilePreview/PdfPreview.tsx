import { useObjectUrl } from '@/shared/lib/hooks/useObjectUrl';
import styles from './FilePreview.module.css';

interface PdfPreviewProps {
  name: string;
  blob: Blob;
}

const PDF_MIME = 'application/pdf';

export function PdfPreview({ name, blob }: PdfPreviewProps) {
  const url = useObjectUrl(blob, PDF_MIME);
  if (url === null) return null;

  return (
    <object className={styles.pdf} data={url} type={PDF_MIME} aria-label={name}>
      <p className={styles.message}>
        Цей браузер не показує PDF всередині додатку.{' '}
        <a className={styles.link} href={url} target="_blank" rel="noreferrer">
          Відкрити в новій вкладці
        </a>
      </p>
    </object>
  );
}