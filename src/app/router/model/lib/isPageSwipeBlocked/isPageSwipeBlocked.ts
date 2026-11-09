import { isEditableTarget, isInHorizontalScroller } from '@/shared/lib/utils/touchTarget';

export const isPageSwipeBlocked = (target: EventTarget | null): boolean =>
  document.querySelector('[aria-modal="true"]') !== null ||
  isEditableTarget(target) ||
  isInHorizontalScroller(target) ||
  (target instanceof Element && target.closest('header') !== null);