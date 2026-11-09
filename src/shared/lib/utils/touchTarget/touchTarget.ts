export const isEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.closest('input, textarea, select') !== null);

export const isInNestedHorizontalScroller = (
  target: EventTarget | null,
  root: Element,
): boolean => {
  let node = target instanceof Element ? target : null;
  while (node && node !== root) {
    if (node.scrollWidth > node.clientWidth) {
      const { overflowX } = getComputedStyle(node);
      if (overflowX === 'auto' || overflowX === 'scroll') return true;
    }
    node = node.parentElement;
  }
  return false;
};

export const isInHorizontalScroller = (target: EventTarget | null): boolean => {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.body) {
    if (node.hasAttribute('data-horizontal-swipe')) return true;
    if (node.scrollWidth > node.clientWidth) {
      const { overflowX } = getComputedStyle(node);
      if (overflowX === 'auto' || overflowX === 'scroll') return true;
    }
    node = node.parentElement;
  }
  return false;
};