export const isCheckboxHit = (block: HTMLElement, clientX: number, slop: number): boolean => {
  // Контракт з RichText.module.css: маркер списку розташований у лівому padding блоку.
  const gutter = parseFloat(getComputedStyle(block).paddingLeft);
  if (Number.isNaN(gutter)) return false;

  const offset = clientX - block.getBoundingClientRect().left;
  return offset >= 0 && offset <= gutter + slop;
};