import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { MenuToggleRow } from '@/shared/ui/MenuToggleRow';
import { TASK_FILTER_META, TASK_FILTER_ORDER } from '../../model/constants/taskFilters';
import { useDayTabCounts } from '../../model/hooks/useDayTabCounts';
import { useTaskView } from '../../model/hooks/useTaskView';
import type { TaskFilter } from '../../model/slice/dayTabSlice';
import { TaskFilterIcon } from '../TaskFilterIcon';

interface TaskFilterSheetProps {
  isOpen: boolean;
  dateKey: string;
  workspaceId: string;
  projectId: string | null;
  onClose: () => void;
}

export function TaskFilterSheet({
  isOpen,
  dateKey,
  workspaceId,
  projectId,
  onClose,
}: TaskFilterSheetProps) {
  const { taskFilter, setTaskFilter, hideEmptyCategories, setHideEmptyCategories } =
    useTaskView();
  const counts = useDayTabCounts(dateKey, workspaceId, projectId);

  const select = (value: TaskFilter) => {
    setTaskFilter(value);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} title="Фільтр завдань" onClose={onClose}>
      <MenuGroup>
      {TASK_FILTER_ORDER.map((value) => {
        const { label, countKey } = TASK_FILTER_META[value];
        return (
          <MenuItem
            key={value}
            icon={<TaskFilterIcon filter={value} size={22} />}
            label={`${label} · ${counts[countKey]}`}
            isSelected={value === taskFilter}
            onClick={() => select(value)}
          />
        );
      })}
      </MenuGroup>
      <MenuGroup>
        <MenuToggleRow
          label="Лише категорії із завданнями"
          checked={hideEmptyCategories}
          onChange={setHideEmptyCategories}
        />
      </MenuGroup>
    </BottomSheet>
  );
}