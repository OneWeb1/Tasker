import { useEffect, useState } from 'react';
import { getTodayKey } from '@/shared/lib/utils/date';

const TICK_MS = 30_000;
const MINUTES_IN_HOUR = 60;

interface Now {
  dateKey: string;
  minutes: number;
}

const readNow = (): Now => {
  const date = new Date();
  return {
    dateKey: getTodayKey(),
    minutes: date.getHours() * MINUTES_IN_HOUR + date.getMinutes(),
  };
};

export function useNowMinutes(): Now {
  const [now, setNow] = useState<Now>(readNow);

  useEffect(() => {
    const update = () => setNow(readNow());
    const interval = window.setInterval(update, TICK_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return now;
}