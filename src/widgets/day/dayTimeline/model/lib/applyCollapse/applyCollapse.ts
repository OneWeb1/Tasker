interface HierarchicalEntry {
  event: { id: string };
  ancestorIds: readonly string[];
}

export interface CollapseState {
  isHidden: boolean;
  isCollapsible: boolean;
  isCollapsed: boolean;
}

export const applyCollapse = <T extends HierarchicalEntry>(
  entries: readonly T[],
  collapsedIds: ReadonlySet<string>,
): Array<T & CollapseState> => {
  const presentIds = new Set(entries.map((entry) => entry.event.id));
  const parentIds = new Set(entries.flatMap((entry) => entry.ancestorIds));

  return entries.map((entry) => ({
    ...entry,
    isHidden: entry.ancestorIds.some((id) => collapsedIds.has(id) && presentIds.has(id)),
    isCollapsible: parentIds.has(entry.event.id),
    isCollapsed: collapsedIds.has(entry.event.id),
  }));
};