import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('hashchange', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('hashchange', onChange);
  };
};

const getSnapshot = (): string => window.location.hash.replace(/^#/, '') || '/';

export function useHashPath() {
  const path = useSyncExternalStore(subscribe, getSnapshot);

   const navigate = useCallback((to: string) => {
     window.location.hash = to;
     listeners.forEach((listener) => listener());
   }, []);

  return [path, navigate] as const;
}