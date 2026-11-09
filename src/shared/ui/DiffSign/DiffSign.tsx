import styles from './DiffSign.module.css';

export type DiffKind = 'same' | 'added' | 'removed' | 'changed';

const SIGNS: Record<Exclude<DiffKind, 'same'>, string> = {
  added: '+',
  removed: '−',
  changed: '~',
};

const LABELS: Record<Exclude<DiffKind, 'same'>, string> = {
  added: 'Додано: ',
  removed: 'Видалено: ',
  changed: 'Змінено: ',
};

interface DiffSignProps {
  kind: DiffKind;
  placement?: 'gutter' | 'corner';
}

export function DiffSign({ kind, placement = 'gutter' }: DiffSignProps) {
  if (kind === 'same') return null;

  return (
    <>
      <span className={styles.srOnly}>{LABELS[kind]}</span>
      <span className={styles.sign} data-diff={kind} data-placement={placement} aria-hidden="true">
        {SIGNS[kind]}
      </span>
    </>
  );
}