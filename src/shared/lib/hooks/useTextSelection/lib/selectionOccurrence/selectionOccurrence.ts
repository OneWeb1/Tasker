export const countOccurrencesBefore = (
  root: HTMLElement | null,
  range: Range,
  text: string,
): number => {
  if (!root || text === '') return 0;

  const head = document.createRange();
  head.selectNodeContents(root);
  head.setEnd(range.startContainer, range.startOffset);
  const before = head.toString();

  let count = 0;
  for (let at = before.indexOf(text); at !== -1; at = before.indexOf(text, at + text.length)) {
    count += 1;
  }
  return count;
};