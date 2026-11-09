import type { ReactNode } from 'react';
import { DateOverrideContext } from '../../model/context/dateOverrideContext';

interface DateOverrideProps {
  dateKey: string;
  children: ReactNode;
}

export function DateOverride({ dateKey, children }: DateOverrideProps) {
  return <DateOverrideContext.Provider value={dateKey}>{children}</DateOverrideContext.Provider>;
}