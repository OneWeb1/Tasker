import type { FieldDiff } from '@/entities/task';
import { DiffSign } from '@/shared/ui/DiffSign';
import type { DiffKind } from '@/shared/ui/DiffSign';
import styles from './DiffText.module.css';

export const plainField = (value: string): FieldDiff => ({
  before: value,
  after: value,
  isChanged: false,
});

interface DiffTextProps {
  field: FieldDiff;
  variant: 'title' | 'description';
  placeholder?: string;
  kind?: DiffKind;
}

export function DiffText({ field, variant, placeholder, kind = 'same' }: DiffTextProps) {
  const lines: { kind: DiffKind; text: string }[] = field.isChanged
    ? [
        ...(field.before ? [{ kind: 'removed' as const, text: field.before }] : []),
        ...(field.after ? [{ kind: 'added' as const, text: field.after }] : []),
      ]
    : [{ kind, text: field.after }];

  return (
    <div className={styles.lines}>
      {lines.map((line) => (
        <div key={line.kind} className={styles.line} data-diff={line.kind} data-variant={variant}>
          <DiffSign kind={line.kind} />
          <p className={styles.copy} data-variant={variant} data-empty={line.text === ''}>
            {line.text || placeholder}
          </p>
        </div>
      ))}
    </div>
  );
}