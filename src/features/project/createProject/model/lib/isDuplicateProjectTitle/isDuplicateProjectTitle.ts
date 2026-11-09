import type { Project } from '@/entities/project';

export const isDuplicateProjectTitle = (projects: readonly Project[], title: string): boolean => {
  const normalized = title.trim().toLowerCase();
  return projects.some((project) => project.title.trim().toLowerCase() === normalized);
};