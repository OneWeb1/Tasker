import type { MouseEvent } from 'react';

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="button"]';

export const focusTextOnTap = (event: MouseEvent<HTMLElement>): void => {
  if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) return;
  const field = event.currentTarget.querySelector('textarea');
  if (!field) return;
  field.focus({ preventScroll: true });
  field.setSelectionRange(field.value.length, field.value.length);
};