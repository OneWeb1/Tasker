import { ChevronDownIcon } from '@/shared/ui/icons';
import type { Workspace } from '../../model/types/workspace';
import styles from './WorkspaceBadge.module.css';

interface WorkspaceBadgeProps {
  workspace: Workspace;
  onClick?: () => void;
}

export function WorkspaceBadge({ workspace, onClick }: WorkspaceBadgeProps) {
  const content = (
    <>
      <span className={styles.title}>{workspace.title}</span>
      {onClick && <ChevronDownIcon className={styles.chevron} width={18} height={18} />}
    </>
  );

  if (!onClick) return <div className={styles.badge}>{content}</div>;

  return (
    <button
      type="button"
      className={styles.badge}
      data-interactive="true"
      aria-haspopup="dialog"
      aria-label={`Робочий простір: ${workspace.title}`}
      onClick={onClick}
    >
      {content}
    </button>
  );
}