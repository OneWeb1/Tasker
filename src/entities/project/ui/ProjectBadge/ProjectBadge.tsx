import type { Project } from '../../model/types/project';
import styles from './ProjectBadge.module.css';

interface ProjectBadgeProps {
  project: Project;
}

export function ProjectBadge({ project }: ProjectBadgeProps) {
  return (
    <span className={styles.badge}>
      <span aria-hidden="true">{project.emoji}</span>
      {project.title}
    </span>
  );
}