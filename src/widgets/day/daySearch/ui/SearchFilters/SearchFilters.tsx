import { useState } from 'react';
import { TASK_PRIORITY_LABELS } from '@/entities/task';
import type { TaskPriority } from '@/entities/task';
import type { SearchPriorityFilter, SearchStatusFilter } from '@/features/day/searchDay';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import {
  CheckIcon,
  ChevronDownIcon,
  FlagIcon,
  ListIcon,
  PostponeIcon,
  StatusIcon,
} from '@/shared/ui/icons';
import { SEARCH_STATUS_OPTIONS } from '../../model/constants/searchFilters';
import styles from './SearchFilters.module.css';

interface SearchFiltersProps {
  status: SearchStatusFilter;
  priority: SearchPriorityFilter;
  onStatusChange: (value: SearchStatusFilter) => void;
  onPriorityChange: (value: SearchPriorityFilter) => void;
}

type OpenSheet = 'status' | 'priority' | null;

const PRIORITY_VALUES = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];

const STATUS_ICONS = {
  all: ListIcon,
  active: StatusIcon,
  done: CheckIcon,
  postponed: PostponeIcon,
} as const;

export function SearchFilters({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}: SearchFiltersProps) {
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const closeSheet = () => setSheet(null);

  const statusLabel =
    status === 'all'
      ? 'Статус'
      : (SEARCH_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Статус');
  const priorityLabel = priority === 'all' ? 'Пріоритет' : TASK_PRIORITY_LABELS[priority];

  return (
    <>
      <div className={styles.chips}>
        <button
          type="button"
          className={styles.chip}
          data-active={status !== 'all'}
          aria-haspopup="dialog"
          onClick={() => setSheet('status')}
        >
          {statusLabel}
          <ChevronDownIcon width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.chip}
          data-active={priority !== 'all'}
          aria-haspopup="dialog"
          onClick={() => setSheet('priority')}
        >
          {priorityLabel}
          <ChevronDownIcon width={16} height={16} />
        </button>
      </div>

      <BottomSheet isOpen={sheet === 'status'} title="Статус" onClose={closeSheet}>
        <MenuGroup>
        {SEARCH_STATUS_OPTIONS.map(({ value, label }) => {
          const Icon = STATUS_ICONS[value];
          return (
            <MenuItem
              key={value}
              icon={<Icon width={22} height={22} />}
              label={label}
              isSelected={value === status}
              onClick={() => {
                onStatusChange(value);
                closeSheet();
              }}
            />
          );
        })}
        </MenuGroup>
      </BottomSheet>

      <BottomSheet isOpen={sheet === 'priority'} title="Пріоритет" onClose={closeSheet}>
        <MenuGroup>
        <MenuItem
          icon={<FlagIcon width={22} height={22} />}
          label="Будь-який пріоритет"
          isSelected={priority === 'all'}
          onClick={() => {
            onPriorityChange('all');
            closeSheet();
          }}
        />
        {PRIORITY_VALUES.map((value) => (
          <MenuItem
            key={value}
            icon={<FlagIcon width={22} height={22} />}
            label={TASK_PRIORITY_LABELS[value]}
            isSelected={value === priority}
            onClick={() => {
              onPriorityChange(value);
              closeSheet();
            }}
          />
        ))}
        </MenuGroup>
      </BottomSheet>
    </>

  );
}