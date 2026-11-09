import { useEffect, useState } from 'react';
import { ActivityHeatmap, ActivityHeatmapPlaceholder } from '@/widgets/profile/activityHeatmap';
import { ProfileOverview } from '@/widgets/profile/profileOverview';
import styles from './ProfilePage.module.css';

const TRANSITION_MS = 360;
const IDLE_TIMEOUT_MS = 250;

export function ProfilePage() {
  const [isHeatmapReady, setIsHeatmapReady] = useState(false);

  useEffect(() => {
    let idleId = 0;
    const show = () => setIsHeatmapReady(true);
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(show, { timeout: IDLE_TIMEOUT_MS });
      } else {
        show();
      }
    }, TRANSITION_MS);

    return () => {
      window.clearTimeout(timer);
      if (idleId !== 0) window.cancelIdleCallback(idleId);
    };
  }, []);

  return (
    <div className={styles.page}>
      <ProfileOverview />
      {isHeatmapReady ? <ActivityHeatmap /> : <ActivityHeatmapPlaceholder />}
    </div>
  );
}