import { ProjectsList } from '@/widgets/project/projectsList';
import styles from './ProjectsPage.module.css';

export function ProjectsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Проєкти</h1>
      <ProjectsList />
    </div>
  );
}