import { getBlockKind, getBlockLevel } from '../noteDocument';

export const getInsertionLevel = (anchor: HTMLElement, isReplacing: boolean): number => {
  const level = getBlockLevel(anchor);
  return !isReplacing && getBlockKind(anchor) === 'toggle' ? level + 1 : level;
};