export const ROUTE_PATHS = {
  today: '/',
  notes: '/notes',
  projects: '/projects',
  profile: '/profile',
  settings: '/settings',
  task: '/task',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

const TASK_PATH_PREFIX = `${ROUTE_PATHS.task}/`;

const STATIC_ROUTE_VALUES: readonly string[] = Object.values(ROUTE_PATHS).filter(
  (value) => value !== ROUTE_PATHS.task,
);

export const buildTaskPath = (id: string, subtaskId?: string): string =>
  `${TASK_PATH_PREFIX}${encodeURIComponent(id)}${
    subtaskId ? `/${encodeURIComponent(subtaskId)}` : ''
  }`;

const readTaskSegment = (path: string, index: number): string | null => {
  if (!path.startsWith(TASK_PATH_PREFIX)) return null;
  const segment = path.slice(TASK_PATH_PREFIX.length).split('/')[index];
  if (!segment) return null;
  try {
    return decodeURIComponent(segment) || null;
  } catch {
    return null;
  }
};

export const parseTaskId = (path: string): string | null => readTaskSegment(path, 0);

export const parseSubtaskId = (path: string): string | null => readTaskSegment(path, 1);

export const resolveRoutePath = (path: string): RoutePath => {
  if (parseTaskId(path) !== null) return ROUTE_PATHS.task;
  return STATIC_ROUTE_VALUES.includes(path) ? (path as RoutePath) : ROUTE_PATHS.today;
};