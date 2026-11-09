interface TimedItem {
  start: number;
  end: number;
}

export const detectOverlaps = (items: readonly TimedItem[]): boolean[] =>
  items.map((item, index) => {
    const previous = items[index - 1];
    return previous !== undefined && item.start < previous.end;
  });