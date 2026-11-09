import { startTransition, useCallback, useMemo, useState } from 'react';
import { SearchTrigger } from '@/features/day/searchDay';
import { useSelectedDate } from '@/features/day/selectDate';
import { useDayTab } from '@/features/day/switchTab';
import type { DayTab } from '@/features/day/switchTab';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { SettingsIcon } from '@/shared/ui/icons';
import { DayTabSettingsSheet } from '@/widgets/day/dayTabSettings';
import { PeriodCarousel } from '@/widgets/period/periodCarousel';
import type { PeriodSelection } from '@/widgets/period/periodCarousel';
import { useDayTabScreen } from '../../model/hooks/useDayTabScreen';
import { PeriodContent } from '../PeriodContent';
import styles from './TodayPage.module.css';

export function TodayPage() {
  const { selectedDate } = useSelectedDate();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();
  const { open: openDayTabScreen } = useDayTabScreen();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodSelection | null>(null);
  const { tab } = useDayTab();
  const range = useMemo(
    () => (period ? { from: period.from, to: period.to } : null),
    [period],
  );
  const openScreen = useCallback(
    (value: DayTab) => openDayTabScreen(value, range),
    [openDayTabScreen, range],
  );

  const handleActiveChange = useCallback((selection: PeriodSelection) => {
    startTransition(() => setPeriod(selection));
  }, []);

  const renderPeriodContent = useCallback(
    (selection: PeriodSelection) => <PeriodContent selection={selection} onOpen={openScreen} />,
    [openScreen],
  );

  return (
    <div className={styles.page}>
      <div className={styles.searchRow}>
        <SearchTrigger />
        <button
          type="button"
          className={styles.customize}
          aria-label="Налаштувати таб"
          aria-haspopup="dialog"
          onClick={() => setIsSettingsOpen(true)}
        >
          <SettingsIcon width={22} height={22} />
        </button>
      </div>
      <div className={styles.body}>
        <PeriodCarousel onActiveChange={handleActiveChange} renderContent={renderPeriodContent} />
      </div>
      <DayTabSettingsSheet
        tab={tab}
        isOpen={isSettingsOpen}
        dateKey={selectedDate}
        workspaceId={workspace.id}
        projectId={activeProjectId}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}