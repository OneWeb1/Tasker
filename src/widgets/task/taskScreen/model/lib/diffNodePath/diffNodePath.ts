import type { DiffNode, TaskDiff } from '@/features/createItem';
import type { DiffSection } from '../../constants/taskDiff';

const SEPARATOR = ':';
const PATH_SEPARATOR = '.';

interface DiffNodeRef {
  section: DiffSection;
  node: DiffNode;
}

export const toDiffNodeId = (section: DiffSection, key: string): string =>
  `${section}${SEPARATOR}${key}`;

export const findDiffNode = (diff: TaskDiff, id: string): DiffNodeRef | null => {
  const [section, key] = id.split(SEPARATOR) as [DiffSection, string | undefined];
  if (!key) return null;

  let list: readonly DiffNode[] = section === 'checklists' ? diff.checklists : diff.subtasks;
  let node: DiffNode | null = null;

  for (const index of key.split(PATH_SEPARATOR)) {
    node = list[Number(index)] ?? null;
    if (!node) return null;
    list = node.children;
  }

  return node ? { section, node } : null;
};