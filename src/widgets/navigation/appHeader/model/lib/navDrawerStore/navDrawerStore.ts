type Listener = () => void;

let isOpen = false;
const listeners = new Set<Listener>();

export const getNavDrawerOpen = (): boolean => isOpen;

export const setNavDrawerOpen = (value: boolean): void => {
  if (isOpen === value) return;
  isOpen = value;
  listeners.forEach((listener) => listener());
};

export const subscribeNavDrawer = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};