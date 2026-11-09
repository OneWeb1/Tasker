export const paintHighlight = (name: string, range: Range | null): void => {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
  if (range) CSS.highlights.set(name, new Highlight(range));
  else CSS.highlights.delete(name);
};