import { createContext, useContext } from 'react';

export const ScreenPortalContext = createContext<HTMLElement | null>(null);

export const useScreenPortal = (): HTMLElement | null => useContext(ScreenPortalContext);