import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { readAvatarFile } from '../lib/avatarImage';
import { selectUserAvatar, userAvatarChanged } from '../slice/settingsSlice';

export function useUserAvatar() {
  const dispatch = useDispatch();
  const userAvatar = useSelector(selectUserAvatar);

  const changeAvatar = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        dispatch(userAvatarChanged(await readAvatarFile(file)));
        return true;
      } catch {
        return false;
      }
    },
    [dispatch],
  );

  return { userAvatar, changeAvatar };
}