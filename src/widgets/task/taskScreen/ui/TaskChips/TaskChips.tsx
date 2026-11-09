import type { CSSProperties, ReactNode } from 'react';
import type { Category } from '@/entities/category';
import { ProjectBadge } from '@/entities/project';
import type { Project } from '@/entities/project';
import { TASK_PRIORITY_LABELS } from '@/entities/task';
import type { FieldDiff, Task, TaskDetailsStatus, TaskFieldDiffs } from '@/entities/task';
import type { Workspace } from '@/entities/workspace';
import { formatShortDate } from '@/shared/lib/utils/date';
import { DiffSign } from '@/shared/ui/DiffSign';
import type { DiffKind } from '@/shared/ui/DiffSign';
import { CalendarIcon, FlagIcon, RestoreIcon } from '@/shared/ui/icons';
import { TASK_STATUS_LABELS } from '../../model/constants/taskScreen';
import { TaskStatusIcon } from '../TaskStatusIcon';
import styles from './TaskChips.module.css';

const CHANGE_STEP = 40;

type TaskChipsSource = Pick<Task, 'date' | 'endDate' | 'startTime' | 'endTime' | 'priority'>;

interface TaskChipsProps {
  task: TaskChipsSource;
  status?: TaskDetailsStatus;
  category?: Category;
  project?: Project;
  workspace?: Workspace;
  scheduleLabel?: string;
  timer?: ReactNode;
  fieldDiffs?: TaskFieldDiffs;
  onOpenStatus?: () => void;
  onOpenDates?: () => void;
  onOpenPriority?: () => void;
  onOpenSchedule?: () => void;
  onOpenProject?: () => void;
  onOpenCategory?: () => void;
  onOpenWorkspace?: () => void;
}

interface ChipProps {
  onClick?: () => void;
  className?: string;
  tone?: string;
  priority?: string;
  children: ReactNode;
}

function Chip({ onClick, className, tone, priority, children }: ChipProps) {
  const classes = className ? `${styles.chip} ${className}` : styles.chip;

  if (!onClick) {
    return (
      <span className={classes} data-static="true" data-tone={tone} data-priority={priority}>
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      data-tone={tone}
      data-priority={priority}
      aria-haspopup="dialog"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface ChangedChipsProps {
  field: FieldDiff;
  icon?: ReactNode;
}

function ChangedChips({ field, icon }: ChangedChipsProps) {
  const changes: { kind: DiffKind; text: string }[] = [];
  if (field.before) changes.push({ kind: 'removed', text: field.before });
  if (field.after) changes.push({ kind: 'added', text: field.after });

  return (
    <span className={styles.changes}>
      {changes.map((change, index) => (
        <span
          key={change.kind}
          className={styles.change}
          data-diff={change.kind}
          style={{ '--diff-sign-top': `${index * CHANGE_STEP}px` } as CSSProperties}
        >
          <DiffSign kind={change.kind} />
          <Chip>
            {icon}
            <span className={styles.text}>{change.text}</span>
          </Chip>
        </span>
      ))}
    </span>
  );
}

interface TaskChipRowProps {
  label: string;
  change?: FieldDiff;
  icon?: ReactNode;
  children: ReactNode;
}

function TaskChipRow({ label, change, icon, children }: TaskChipRowProps) {
  const isChanged = change?.isChanged ?? false;

  return (
    <div className={styles.row} data-changed={isChanged || undefined}>
      <span className={styles.label}>{label}</span>
      {change && isChanged ? <ChangedChips field={change} icon={icon} /> : children}
    </div>
  );
}

const formatMoment = (dateKey: string, time: string | null): string =>
  time ? `${formatShortDate(dateKey)} ${time}` : formatShortDate(dateKey);

const getDatesLabel = (task: TaskChipsSource): string => {
  const hasRange = Boolean(task.endDate) && (task.endDate ?? '') > task.date;
  const hasTime = Boolean(task.startTime && task.endTime);
  const start = formatMoment(task.date, hasTime ? task.startTime : null);

  if (hasRange) {
    return `${start} → ${formatMoment(task.endDate ?? task.date, hasTime ? task.endTime : null)}`;
  }
  return hasTime ? `${start} → ${task.endTime}` : start;
};

export function TaskChips({
  task,
  status,
  category,
  project,
  workspace,
  scheduleLabel,
  timer,
  fieldDiffs,
  onOpenStatus,
  onOpenDates,
  onOpenPriority,
  onOpenSchedule,
  onOpenProject,
  onOpenCategory,
  onOpenWorkspace,
}: TaskChipsProps) {
  const hasWeekdays =
    fieldDiffs !== undefined &&
    (fieldDiffs.weekdays.before !== '' || fieldDiffs.weekdays.after !== '');

  return (
    <div className={styles.chips}>
      {status && (
        <TaskChipRow label="Статус">
          <Chip tone={status} onClick={onOpenStatus}>
            <TaskStatusIcon status={status} size={18} />
            {TASK_STATUS_LABELS[status]}
          </Chip>
        </TaskChipRow>
      )}
      <TaskChipRow
        label="Дати"
        change={fieldDiffs?.dates}
        icon={<CalendarIcon width={18} height={18} />}
      >
        <Chip className={styles.dates} onClick={onOpenDates}>
          <CalendarIcon width={18} height={18} />
          <span className={styles.text}>{getDatesLabel(task)}</span>
        </Chip>
      </TaskChipRow>
      {scheduleLabel !== undefined && Boolean(onOpenSchedule || fieldDiffs) && (
        <TaskChipRow
          label="Повторення"
          change={fieldDiffs?.schedule}
          icon={<RestoreIcon width={18} height={18} />}
        >
          <Chip onClick={onOpenSchedule}>
            <RestoreIcon width={18} height={18} />
            {scheduleLabel}
          </Chip>
        </TaskChipRow>
      )}
      {hasWeekdays && fieldDiffs && (
        <TaskChipRow label="Дні" change={fieldDiffs.weekdays}>
          <Chip>{fieldDiffs.weekdays.after}</Chip>
        </TaskChipRow>
      )}
      <TaskChipRow
        label="Пріоритет"
        change={fieldDiffs?.priority}
        icon={<FlagIcon width={18} height={18} />}
      >
        <Chip priority={task.priority} onClick={onOpenPriority}>
          <FlagIcon width={18} height={18} />
          {task.priority ? TASK_PRIORITY_LABELS[task.priority] : 'Не вибрано'}
        </Chip>
      </TaskChipRow>
      {(category || fieldDiffs?.category.isChanged) && (
        <TaskChipRow label="Категорія" change={fieldDiffs?.category}>
          <Chip onClick={onOpenCategory}>
            <span aria-hidden="true">{category?.emoji}</span>
            {category?.title}
          </Chip>
        </TaskChipRow>
      )}
      {(project || onOpenProject || fieldDiffs?.project.isChanged) && (
        <TaskChipRow label="Проєкт" change={fieldDiffs?.project}>
          <Chip onClick={onOpenProject}>
            {project ? <ProjectBadge project={project} /> : 'Без проєкту'}
          </Chip>
        </TaskChipRow>
      )}
      {workspace && (
        <TaskChipRow label="Простір">
          <Chip onClick={onOpenWorkspace}>
            <span aria-hidden="true">{workspace.emoji}</span>
            {workspace.title}
          </Chip>
        </TaskChipRow>
      )}
      {timer && <TaskChipRow label="Таймер">{timer}</TaskChipRow>}
    </div>
  );
}