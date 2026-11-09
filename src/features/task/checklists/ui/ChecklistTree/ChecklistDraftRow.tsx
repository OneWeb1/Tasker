import { ChecklistTitleInput } from '../ChecklistTitleInput';
import styles from './ChecklistTree.module.css';

interface ChecklistDraftRowProps {
  onCommit: (title: string) => void;
  onEnd: () => void;
}

export function ChecklistDraftRow({ onCommit, onEnd }: ChecklistDraftRowProps) {
  return (
    <div className={styles.row} data-editing="true">
      <span className={styles.gutter} />
      <span className={styles.ghostBox} aria-hidden="true" />
      <ChecklistTitleInput
        label="Новий пункт чекліста"
        placeholder="Новий пункт"
        keepOpenOnEnter
        onCommit={onCommit}
        onEnd={onEnd}
      />
    </div>
  );
}