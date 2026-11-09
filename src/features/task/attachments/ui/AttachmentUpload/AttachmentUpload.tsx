import { PlusIcon } from '@/shared/ui/icons';
import { useFilePicker } from '../../model/hooks/useFilePicker';
import styles from './AttachmentUpload.module.css';

interface AttachmentUploadProps {
  error: string | null;
  canAdd: boolean;
  onFiles: (files: File[]) => void;
}

export function AttachmentUpload({ error, canAdd, onFiles }: AttachmentUploadProps) {
  const { inputRef, open, handleChange } = useFilePicker(onFiles);

  return (
    <>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {canAdd && (
        <button type="button" className={styles.add} onClick={open}>
          <PlusIcon width={24} height={24} />
          Завантажити вкладення
        </button>
      )}
      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
    </>
  );
}