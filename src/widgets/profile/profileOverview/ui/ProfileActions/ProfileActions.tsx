import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { CameraIcon, EditIcon, SettingsIcon } from '@/shared/ui/icons';
import styles from './ProfileActions.module.css';

interface ProfileActionsProps {
  onPhotoSelected: (file: File) => void;
  onEdit: () => void;
  onOpenSettings: () => void;
}

export function ProfileActions({ onPhotoSelected, onEdit, onOpenSettings }: ProfileActionsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onPhotoSelected(file);
  };

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.action} onClick={() => inputRef.current?.click()}>
        <CameraIcon />
        <span className={styles.label}>Вибрати фото</span>
      </button>
      <button type="button" className={styles.action} onClick={onEdit}>
        <EditIcon />
        <span className={styles.label}>Змінити</span>
      </button>
      <button type="button" className={styles.action} onClick={onOpenSettings}>
        <SettingsIcon />
        <span className={styles.label}>Налаштування</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        tabIndex={-1}
        onChange={handleChange}
      />
    </div>
  );
}