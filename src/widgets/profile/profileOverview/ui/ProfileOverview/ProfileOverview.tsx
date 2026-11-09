import { UserAvatar } from '@/features/settings/managePreferences';
import { useProfileOverview } from '../../model/hooks/useProfileOverview';
import { ProfileActions } from '../ProfileActions';
import styles from './ProfileOverview.module.css';

export function ProfileOverview() {
  const {
    tasksCount,
    projectsCount,
    userName,
    hasAvatarError,
    editName,
    pickAvatar,
    openSettings,
  } = useProfileOverview();

  return (
    <section className={styles.overview}>
      <div className={styles.hero}>
        <div className={styles.avatar}>
          <UserAvatar size={94} />
        </div>
        <div className={styles.identity}>
          <h1 className={styles.name}>{userName || 'Профіль'}</h1>
          {!userName && <p className={styles.hint}>Вкажіть ім’я кнопкою «Змінити»</p>}
        </div>
        <ProfileActions
          onPhotoSelected={pickAvatar}
          onEdit={editName}
          onOpenSettings={openSettings}
        />
        {hasAvatarError && (
          <p className={styles.error} role="alert">
            Не вдалося завантажити фото. Спробуйте інше зображення.
          </p>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.value}>{tasksCount}</span>
            <span className={styles.caption}>Завдань</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.value}>{projectsCount}</span>
            <span className={styles.caption}>Проєктів</span>
          </div>
        </div>
      </div>
    </section>

  );
}