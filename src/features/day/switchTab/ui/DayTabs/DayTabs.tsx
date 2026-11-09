import type { ReactNode } from 'react';
import type { DateRange } from '@/shared/lib/utils/date';
import { Tabs } from '@/shared/ui/Tabs';
import { NotesIcon, TodayIcon } from '@/shared/ui/icons';
import { TASK_FILTER_META } from '../../model/constants/taskFilters';
import { useDayTab } from '../../model/hooks/useDayTab';
import { useDayTabCounts } from '../../model/hooks/useDayTabCounts';
import { useTaskView } from '../../model/hooks/useTaskView';
import type { DayTab } from '../../model/slice/dayTabSlice';
import { TaskFilterIcon } from '../TaskFilterIcon';

interface DayTabsProps {
  dateKey: string;
  workspaceId: string;
  projectId: string | null;
  range?: DateRange | null;
  eventsCount?: number;
  notesCount?: number;
  onOpen: (tab: DayTab) => void;
}

export function DayTabs({
  dateKey,
  workspaceId,
  projectId,
  range,
  eventsCount,
  notesCount,
  onOpen,
}: DayTabsProps) {
  const { tab, setTab } = useDayTab();
  const { taskFilter } = useTaskView();
  const counts = useDayTabCounts(dateKey, workspaceId, projectId, range);

  const items: readonly {
    value: DayTab;
    label: string;
    icon: ReactNode;
    count?: number;
    caption: string;
  }[] = [
    {
      value: 'tasks',
      label: 'Завдання',
      icon: <TaskFilterIcon filter={taskFilter} />,
      count: counts[TASK_FILTER_META[taskFilter].countKey],
      caption: `Прострочені: ${counts.overdue}`,
    },
    {
      value: 'events',
      label: 'Події',
      icon: <TodayIcon />,
      count: eventsCount,
      caption: 'Календар',
    },
    {
      value: 'notes',
      label: 'Нотатки',
      icon: <NotesIcon />,
      count: notesCount,
      caption: 'Усі нотатки',
    },
  ];

  return (
    <Tabs
      ariaLabel="Режим дня"
      variant="card"
      items={items}
      value={tab}
      onChange={(value) => {
        setTab(value);
        onOpen(value);
      }}
      onReselect={onOpen}
    />
  );
}