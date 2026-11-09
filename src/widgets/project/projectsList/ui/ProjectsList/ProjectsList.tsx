import { ProjectBadge } from '@/entities/project';
import { useProjectsList } from '../../model/hooks/useProjectsList';
import styles from './ProjectsList.module.css';

export function ProjectsList() {
  const items = useProjectsList();

  if (items.length === 0) {
    return <p className={styles.empty}>Проєктів поки немає</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map(({ project, openTasksCount }) => (
        <li key={project.id} className={styles.item}>
          <ProjectBadge project={project} />
          <span className={styles.count}>Активних: {openTasksCount}</span>
        </li>
      ))}
    </ul>
  );
}