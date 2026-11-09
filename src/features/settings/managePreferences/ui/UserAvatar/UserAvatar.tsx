import { DefaultAvatar } from '@/shared/ui/DefaultAvatar';
import { useSettings } from '../../model/hooks/useSettings';
import { useUserAvatar } from '../../model/hooks/useUserAvatar';
import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  size: number;
}

export function UserAvatar({ size }: UserAvatarProps) {
  const { userInitial } = useSettings();
  const { userAvatar } = useUserAvatar();

  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
    >
      {userAvatar ? (
        <img className={styles.photo} src={userAvatar} alt="" />
      ) : userInitial ? (
        <span className={styles.initial}>{userInitial}</span>
      ) : (
        <DefaultAvatar />
      )}
    </span>
  );
}