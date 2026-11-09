import type { SearchResultKind } from '../../types/searchScreen';

type HasEntry = { entry: { kind: SearchResultKind; date: string } };

export interface SearchResultGroup<T extends HasEntry> {
  dateKey: string;
  items: T[];
}

export interface SearchResultSection<T extends HasEntry> {
  kind: SearchResultKind | null;
  groups: SearchResultGroup<T>[];
}

const KIND_ORDER: readonly SearchResultKind[] = ['task', 'subtask', 'note'];

const groupByDate = <T extends HasEntry>(items: readonly T[]): SearchResultGroup<T>[] => {
  const groups: SearchResultGroup<T>[] = [];

  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.dateKey === item.entry.date) last.items.push(item);
    else groups.push({ dateKey: item.entry.date, items: [item] });
  }

  return groups;
};

export const groupSearchResults = <T extends HasEntry>(
  items: readonly T[],
  splitByKind: boolean,
): SearchResultSection<T>[] => {
  if (items.length === 0) return [];
  if (!splitByKind) return [{ kind: null, groups: groupByDate(items) }];

  return KIND_ORDER.map((kind) => ({
    kind,
    items: items.filter((item) => item.entry.kind === kind),
  }))
    .filter((section) => section.items.length > 0)
    .map(({ kind, items: kindItems }) => ({ kind, groups: groupByDate(kindItems) }));
};